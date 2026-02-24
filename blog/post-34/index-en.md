---
date: '2025-03-30 17:30:00'
slug: 'one-does-not-simply-write-a-ssh-config-parser-in-rust'
title: 'One does not simply write a SSH config parser (in Rust)'
subtitle: 'A journey through the land of Rust, nom and SSH config files'
author: 'veeso'
featuredImage: ./featured.jpeg
tag: rust
---

Do you know the feeling when you start a project and you think it will be easy, but then you realize that it is not? This is the story of the implementation of [ssh2-config](https://github.com/veeso/ssh2-config), a Rust library to parse SSH config files.

Why did I write this? Because basically most of [termscp](https://github.com/veeso/termscp) users wanted to have a way to use their SSH config files with it. And obviously the only way to achieve that was to write a library that would parse SSH config files.

## I F\*ck\*d up

This is an example of a SSH configuration file:

```txt
User veeso

Host 192.168.1.*
    compression yes
    User foo

Host 192.168.1.1
    User root
    Port 2222
    IdentityFile ~/.ssh/id_rsa
```

So what's obvious is that in SSH configuration we can specify specific or pattern rules for hosts.

So for example we've got the first rule `User veeso` which is general for all hosts and in case we're connecting to `192.168.1.1` both host blocks rules will be taken.

But how are conflicts resolved?

If your mind is sane enough, you would think that the most specific rule wins in conflicts.

So for instance if we connect to `192.168.1.1` you would expect the `User` to be `root`, because

So you would expect this kind of hierarchy: `* < 192.168.1.* < 192.168.1.1`

![for-the-better meme](./for-the-better.webp)

No, you're wrong.

The SSH configuration doesn't give a f\*ck about hierarchy.

In the manual page from OpenBSD for SSH-config we can read:

> Unless noted otherwise, for each parameter, **the first obtained value will be used**. The configuration files contain sections separated by Host specifications, and that section is only applied for hosts that match one of the patterns given in the specification. The matched host name is usually the one given on the command line (see the CanonicalizeHostname option for exceptions).
>
> Since the first obtained value for each parameter is used, **more host-specific declarations should be given near the beginning of the file**, and general defaults at the end.

And it just took 4 major versions of my parser to figure that out.

Should have I read the entire documentation before starting the implementation? Yes. Did I? No. I thought I could just read the first few lines and then implement the parser. But no, I had to read the entire documentation to understand how it works.

Why didn't I read this part? Because everybody would think that the most specific rule wins in conflicts. And I thought that it was obvious. But no, it's not. It's not obvious at all. And I had to learn it the hard way.

## So how do we setup this?

First of all what we could think the configuration with a structure like this:

`Config -> HostMatch -> Parameters`

so let's dive into the code, bottom-up

### Parameters

We'll need to define a structure that will hold all the parameters we can find in the SSH configuration file and what parameters we want to support.

```rust
/// Describes the ssh configuration.
/// Configuration is describes in this document: <http://man.openbsd.org/OpenBSD-current/man5/ssh_config.5>
/// Only arguments supported by libssh2 are implemented
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HostParams {
    pub bind_address: Option<String>,
    pub bind_interface: Option<String>,
    pub ca_signature_algorithms: Algorithms,
    pub certificate_file: Option<PathBuf>,
    pub ciphers: Algorithms,
    pub compression: Option<bool>,
    pub connection_attempts: Option<usize>,
    pub connect_timeout: Option<Duration>,
    pub host_key_algorithms: Algorithms,
    pub host_name: Option<String>,
    pub identity_file: Option<Vec<PathBuf>>,
    pub ignore_unknown: Option<Vec<String>>,
    pub kex_algorithms: Algorithms,
    pub mac: Algorithms,
    pub port: Option<u16>,
    pub pubkey_accepted_algorithms: Algorithms,
    pub pubkey_authentication: Option<bool>,
    pub remote_forward: Option<u16>,
    pub server_alive_interval: Option<Duration>,
    pub tcp_keep_alive: Option<bool>,
    pub user: Option<String>,
    pub ignored_fields: HashMap<String, Vec<String>>,
    pub unsupported_fields: HashMap<String, Vec<String>>,
}
```

### Host

The host structure will hold two things:

- the **rule to match** against that host
- the parameters to be used for that host

```rust
/// Describes the rules to be used for a certain host
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Host {
    /// List of hosts for which params are valid. String is string pattern, bool is whether condition is negated
    pub pattern: Vec<HostClause>,
    pub params: HostParams,
}

/// Describes a single clause to match host
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HostClause {
    pub pattern: String,
    pub negated: bool,
}
```

The host clause will hold the pattern to match against the host and a boolean to indicate whether the condition is negated or not.
The pattern is a string that can be a hostname, an IP address or a wildcard pattern.

and finally we can implement the `intersects` method to check if the host matches the pattern:

```rust
impl Host {
    /// Returns whether `host` argument intersects the host clauses
    pub fn intersects(&self, host: &str) -> bool {
        let mut has_matched = false;
        for entry in self.pattern.iter() {
            let matches = entry.intersects(host);
            // If the entry is negated and it matches we can stop searching
            if matches && entry.negated {
                return false;
            }
            has_matched |= matches;
        }
        has_matched
    }
}

impl HostClause {
    /// Returns whether `host` argument intersects the clause
    pub fn intersects(&self, host: &str) -> bool {
        WildMatch::new(self.pattern.as_str()).matches(host)
    }
}
```

### SSH Config

Eventually, SSH config will be our top level structure.

The idea is to have a `Vec<Host>` with all the possible matches for hosts; hosts will be identified by their matching pattern.

```rust
/// Describes the ssh configuration.
/// Configuration is described in this document: <http://man.openbsd.org/OpenBSD-current/man5/ssh_config.5>
#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct SshConfig {
    /// Rulesets for hosts.
    /// Default config will be stored with key `*`
    hosts: Vec<Host>,
}
```

And we'll mainly need two methods:

- one to parse the configuration from file:

  ```rust
  pub fn parse(mut self, reader: &mut impl BufRead) -> SshParserResult<Self> {
      parser::SshConfigParser::parse(&mut self, reader).map(|_| self)
  }
  ```

- one to query parameters for a certain host:

  ```rust
  pub fn query<S: AsRef<str>>(&self, pattern: S) -> HostParams {
      let mut params = HostParams::new(&self.default_algorithms);
      // iter keys, overwrite if None top-down
      for host in self.hosts.iter() {
          if host.intersects(pattern.as_ref()) {
              debug!(
                  "Merging params for host: {:?} into params {params:?}",
                  host.pattern
              );
              params.overwrite_if_none(&host.params);
              trace!("Params after merge: {params:?}");
          }
      }
      // return calculated params
      params
  }
  ```

  The query function will start with a default `HostParams` and after that we'll iterate over all the hosts, check if the provided pattern intersects with the host pattern for that host, and if so it will overwrite the current parameters unset values with the host parameters.
  We **MUST NOT** overwrite the current parameters if they are already set, because the first obtained value will be used.

  And another very important thing: we need to store hosts in a top-down order, because the first obtained value will be used. So if we have a more specific host match, it should be at the top of the list. This basically means that Host in the Vector must be ordered as they are in the file.

Now we can start finally implementing the parser itself, which is called `SshConfigParser` and is located in the `parser` module.

## Implementing the parser

First, initialize our `parse` function:

```rust
    pub fn parse(
        config: &mut SshConfig,
        reader: &mut impl BufRead,
    ) -> SshParserResult<()> {
      // ...
    }
```

We'll have to read the file line by line and parse each line.

Any line that contains a valid parameter, must refer to the current Host parameters.

So the first thing we need to do is to create the first Host, which since is not part of any host block, will have as pattern match `*`, which means, anything.

```rust
config.hosts.push(Host::new(
    vec![HostClause::new(String::from("*"), false)],
    HostParams::new(),
));

// get current host pointer
let mut current_host = config.hosts.last_mut().unwrap();
```

and now we can start iterating line by line:

```rust
let mut lines = reader.lines();
// iter lines
loop {
    let line = match lines.next() {
        None => break,
        Some(Err(err)) => return Err(SshParserError::Io(err)),
        Some(Ok(line)) => Self::strip_comments(line.trim()),
    };
    if line.is_empty() {
        continue;
    }
    // tokenize
    let (field, args) = match Self::tokenize_line(&line) {
        Ok((field, args)) => (field, args),
        Err(SshParserError::UnknownField(field, args))
            if rules.intersects(ParseRule::ALLOW_UNKNOWN_FIELDS)
                || current_host.params.ignored(&field) =>
        {
            current_host.params.ignored_fields.insert(field, args);
            continue;
        }
        Err(SshParserError::UnknownField(field, args)) => {
            return Err(SshParserError::UnknownField(field, args));
        }
        Err(err) => return Err(err),
    };
    // If field is block, init a new block
    if field == Field::Host {
        // Pass `ignore_unknown` from global overrides down into the tokenizer.
        let mut params = HostParams::new(&config.default_algorithms);
        params.ignore_unknown = config.hosts[0].params.ignore_unknown.clone();
        let pattern = Self::parse_host(args)?;
        trace!("Adding new host: {pattern:?}",);

        // Add a new host
        config.hosts.push(Host::new(pattern, params));
        // Update current host pointer
        current_host = config.hosts.last_mut().unwrap();
    } else {
        // Update field
        match Self::update_host(
            field,
            args,
            current_host,
            rules,
            &config.default_algorithms,
        ) {
            Ok(()) => Ok(()),
            // If we're allowing unsupported fields to be parsed, add them to the map
            Err(SshParserError::UnsupportedField(field, args))
                if rules.intersects(ParseRule::ALLOW_UNSUPPORTED_FIELDS) =>
            {
                current_host.params.unsupported_fields.insert(field, args);
                Ok(())
            }
            // Eat the error here to not break the API with this change
            // Also it'd be weird to error on correct ssh_config's just because they're
            // not supported by this library
            Err(SshParserError::UnsupportedField(_, _)) => Ok(()),
            e => e,
        }?;
    }
}

// finally return Ok
Ok(())
```

### Tokenizing lines

A further complexity with tokenizing lines in the ssh configuration, is that we MUST support all of these syntax for defining the parameters:

- `Field value`
- `Field=value`
- `Field = value`
- `Field "hello world"` - Quotes are used to escape spaces
- `Field="hello world"`

So fields can be either be separated by `=` or by spaces, or either.

And not to mention that the field can have any indentation before it.

````rust
/// Tokenize line if possible. Returns [`Field`] name and args as a [`Vec`] of [`String`].
///
/// All of these lines are valid for tokenization
///
/// ```txt
/// IgnoreUnknown=Pippo,Pluto
/// ConnectTimeout = 15
/// Ciphers "Pepperoni Pizza,Margherita Pizza,Hawaiian Pizza"
/// Macs="Pasta Carbonara,Pasta con tonno"
/// ```
///
/// So lines have syntax `field args...`, `field=args...`, `field "args"`, `field="args"`
fn tokenize_line(line: &str) -> SshParserResult<(Field, Vec<String>)> {
    // check what comes first, space or =?
    let trimmed_line = line.trim();
    // first token is the field, and it may be separated either by a space or by '='
    let (field, other_tokens) = if trimmed_line.find('=').unwrap_or(usize::MAX)
        < trimmed_line.find(char::is_whitespace).unwrap_or(usize::MAX)
    {
        trimmed_line
            .split_once('=')
            .ok_or(SshParserError::MissingArgument)?
    } else {
        trimmed_line
            .split_once(char::is_whitespace)
            .ok_or(SshParserError::MissingArgument)?
    };

    trace!("tokenized line '{line}' - field '{field}' with args '{other_tokens}'",);

    // other tokens should trim = and whitespace
    let other_tokens = other_tokens.trim().trim_start_matches('=').trim();
    trace!("other tokens trimmed: '{other_tokens}'",);

    // if args is quoted, don't split it
    let args = if other_tokens.starts_with('"') && other_tokens.ends_with('"') {
        trace!("quoted args: '{other_tokens}'",);
        vec![other_tokens[1..other_tokens.len() - 1].to_string()]
    } else {
        trace!("splitting args (non-quoted): '{other_tokens}'",);
        // split by whitespace
        let tokens = other_tokens.split_whitespace();

        tokens
            .map(|x| x.trim().to_string())
            .filter(|x| !x.is_empty())
            .collect()
    };

    match Field::from_str(field) {
        Ok(field) => Ok((field, args)),
        Err(_) => Err(SshParserError::UnknownField(field.to_string(), args)),
    }
}
````

A lot of fun, right?

After that we'll need to implement the `update_host` function, which will update the current host parameters with the new parameters.

```rust
fn update_host(
    field: Field,
    args: Vec<String>,
    host: &mut Host,
    rules: ParseRule,
    default_algos: &DefaultAlgorithms,
) -> SshParserResult<()> {
    trace!("parsing field {field:?} with args {args:?}",);
    let params = &mut host.params;
    match field {
        Field::BindAddress => {
            let value = Self::parse_string(args)?;
            trace!("bind_address: {value}",);
            params.bind_address = Some(value);
        }
        // ...
    }
}
```

And we'll have a parser which converts the args `Vec<String>` into the correct type for each parameter.
For example, for the `BindAddress` field, we can have a simple string:

```rust
/// Parse string argument
fn parse_string(args: Vec<String>) -> SshParserResult<String> {
    if let Some(s) = args.into_iter().next() {
        Ok(s)
    } else {
        Err(SshParserError::MissingArgument)
    }
}
```

And anything else for every other type, for example booleans have to be parsed as `yes -> true` and `no -> false`, etc.

And with that we can parse the SSH configuration file and get the parameters for a certain host.

If it wasn't for the fact that there is the `Include` directive.

## The Include directive

The `Include` directive is a special directive that allows you to include other SSH configuration files in your main configuration file.

Basically it accepts a `path` to a file or a glob pattern, and it will include all the files that match the pattern.

How are the parameters applied? Luckily or not, it behaves like the parameters contained in the included file are placed where the `Include` directive is.

So in the update_host function, when we have include:

```rust
Field::Include => {
    Self::include_files(args, host, rules)?;
}
```

At this point let's see how to do this. Basically we need to open each file and read them to a new `SshConfig` object, and then merge the parameters into the current host.

```rust
/// include a file by parsing it and updating host rules by merging the read config to the current one for the host
fn include_files(
    args: Vec<String>,
    host: &mut Host,
    rules: ParseRule,
) -> SshParserResult<()> {
    let path_match = Self::parse_string(args)?;
    trace!("include files: {path_match}",);
    let files = glob(&path_match)?;

    for file in files {
        let file = file?;
        trace!("including file: {}", file.display());
        let mut reader = BufReader::new(File::open(file)?);
        let mut sub_config = SshConfig::default();
        Self::parse(&mut sub_config, &mut reader, rules)?;

        // merge sub-config into host
        for pattern in &host.pattern {
            if pattern.negated {
                trace!("excluding sub-config for pattern: {pattern:?}",);
                continue;
            }
            trace!("merging sub-config for pattern: {pattern:?}",);
            let params = sub_config.query(&pattern.pattern);
            host.params.overwrite_if_none(&params);
        }
    }

    Ok(())
}
```

## Uncovered topics

There are some things that I didn't cover in this article, like:

- The `Algorithms` struct, which is a wrapper around a `Vec<String>` and provides some helper methods to parse the algorithms from the SSH configuration file. Why? Because algorithms in SSH config are a comma separated list of algorithms and can specify with a prefix whether the algorithms should replace, head, appended or exclude to/from default algorithms.
- **Default algorithms**: if you want to deal with algorithms on ssh config, you need to know what the default algorithms are. And guess what? There's not any rust library which interacts with openssh which exposes them. So how did I do this? I wrote a PARSER of a C header file which parses the latest defines from the openssh repository. This is a bit hacky, but it works. And I think it's the only way to do this.

## Conclusion

In this article I tried to cover the main points of the implementation of the SSH config parser in Rust.
I hope you enjoyed it and learned something new. I also hope that you will not have to go through the same pain I went through to implement this parser.
