import Link from "next/link";
import React from "react";
import "./footer.module.scss";

export default function Footer() {
  return (
    <div
      id="footer"
      style={{ bottom: "3px", width: "100vw" }}
      className="fixed-bottom"
    >
      {/* Show a copy right for the current year */}
      <h4 className="w-100 text-center">
        Created by kees van Opdorp 2022 - {new Date().getFullYear()} &copy;
      </h4>
      <h5 className="w-100 text-center text-black">
        <Link href="https://ergast.com/mrd/" passHref>
          <a target="_blank" rel="noopener noreferrer" className="text-black">
            Powered by ergast F1 API
          </a>
        </Link>
      </h5>
      <h6 className="w-100 text-center">
        This website is not affilated with FOM&copy;
      </h6>
    </div>
  );
}
