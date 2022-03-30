import Navbar from "@components/navbar";
import { Container, Accordion } from "react-bootstrap";

function About() {
    return (
        <>
            <Navbar />
            <Container fluid className="mt-3">
                <h2 className="w-100 text-center">FAQ</h2>
                <Accordion>
                    <Accordion.Header>What is this webiste for</Accordion.Header>
                </Accordion>
            </Container>
        </>
    )
}

export default About;