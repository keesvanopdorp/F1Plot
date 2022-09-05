import { Footer, Navbar } from "@components";
import axios, { AxiosResponse } from "axios";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { Accordion, Container } from "react-bootstrap";

export default function About() {
  const [content, setContent] = useState<{ [key: string]: string }>({});
  const [styles, setStyles] = useState<string>("");

  // runs when the page is load and is ony run once
  useEffect((): void => {
    // Gets the FAQ questions from the content folder
    axios.get("/content/faq.json").then((res: AxiosResponse) => {
      setContent(res.data);
    });

    // Calculates the the styling for the accordion
    setStyles(`${window.innerWidth < 576 ? "w-100" : "w-50"} mx-auto mt-3`);
  }, []);

  return (
    <>
      <Head>
        <title>F1Plot: about</title>
      </Head>
      <Navbar />
      <Container fluid className="mt-3">
        <h2 className="w-100 text-center">FAQ</h2>
        <Accordion className={styles}>
          {Object.keys(content).map((key: string, index: number) => (
            <Accordion.Item eventKey={index.toString()} key={key}>
              <Accordion.Header>{key}</Accordion.Header>
              <Accordion.Body>{content[key]}</Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
        <Footer />
      </Container>
    </>
  );
}
