import * as React from "react";
import styled from "styled-components";
import { Link } from "gatsby";
import Heading from "../design/Heading";
import { readingTime } from "../utils/utils";
import { GatsbyImage, IGatsbyImageData } from "gatsby-plugin-image";

interface Props {
  link: string;
  title: string;
  excerpt: string;
  date: string;
  subtitle: string;
  body: string;
  image?: IGatsbyImageData;
}

const Container = styled.div`
  padding: 8px;
  border-bottom: 1px solid #ccc;
`;

const Excerpt = styled.p`
  color: #222;
`;

const Date = styled.p`
  color: #444;
`;

const Preview = styled.div`
  padding: 24px 0;
`;

const PostLink = (props: Props) => {
  const preview = props.image ? (
    <Preview>
      <GatsbyImage image={props.image} alt="" className="absolute inset-0" />
    </Preview>
  ) : undefined;
  return (
    <Container>
      {preview}
      <Heading.H2>
        <Link to={props.link}>{props.title}</Link>
      </Heading.H2>
      <Heading.H3>{props.subtitle}</Heading.H3>
      <Excerpt>{props.excerpt}</Excerpt>
      <Date>
        Published on {props.date} — {readingTime(props.body)} min read{" "}
      </Date>
    </Container>
  );
};

export default PostLink;
