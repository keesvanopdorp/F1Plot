import Link from "next/link";
import React, { Component, ReactNode } from "react";
import { Container, Nav, Navbar as BsNavbar } from "react-bootstrap";

export default class Navbar extends Component {
    render(): ReactNode {
        return (
            <BsNavbar variant='dark' bg="dark">
                <Container>
                    <Link passHref href="/">
                        <h1 className='w-25 text-center text-white'>F1Plot</h1>
                    </Link>
                    <Nav>
                        <Nav.Link href='/'>Home</Nav.Link>
                        <Nav.Link href='/about'>About</Nav.Link>
                    </Nav>
                </Container>
            </BsNavbar>
        )
    }
}