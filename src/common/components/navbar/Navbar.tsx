import Link from "next/link";
import React from "react";
import { Container, Nav, Navbar as BsNavbar } from "react-bootstrap";

export default function Navbar() {
  return (
    <BsNavbar variant="dark" bg="dark">
      <Container>
        <Link passHref href="/">
          <h1 className="w-25 text-center text-white">F1Plot</h1>
        </Link>
        <Nav>
          <Nav.Link href="/">Home page</Nav.Link>
          <Nav.Link href="/about">FAQ / About</Nav.Link>
        </Nav>
      </Container>
    </BsNavbar>
  );
}
