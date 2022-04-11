import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { Container, Accordion } from "react-bootstrap";
import Axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import Head from "next/head";

// export const getStaticProps = async () => {

// }

function About() {
    const [content, setContent] = useState<{ [key: string]: string }>({})
    useEffect(() => {
        Axios.get('/content/faq.json').then((res: AxiosResponse) => {
            setContent(res.data);
        })
    }, [])
    return (
        <>
            <Head>
                <title>F1Plot: about</title>
            </Head>
            <Navbar />
            <Container fluid className="mt-3">
                <h2 className="w-100 text-center">FAQ</h2>
                <Accordion>
                    {Object.keys(content).map((key: string, index: number) => (
                        <Accordion.Item eventKey={index.toString()} key={index} className={`${window.innerWidth < 576 ? 'w-100' : 'w-50'} mx-auto`}>
                            <Accordion.Header>{key}</Accordion.Header>
                            <Accordion.Body>{content[key]}</Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>
                <Footer />
            </Container>
        </>
    )
}

export default About;