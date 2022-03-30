import Link from "next/link";
import { Component, ReactNode } from "react";
import './footer.module.scss';

export default class Footer extends Component {
    render(): ReactNode {
        return (
            <div id="footer" style={{ bottom: '3px', width: '100vw' }} className="fixed-bottom">
                <h4 className="w-100 text-center">Created by kees van Opdorp 2022 - {new Date().getFullYear()} &copy;</h4>
                <h5 className="w-100 text-center text-black">
                    <Link href="https://ergast.com/mrd/" passHref prefetch={true}>
                        <a target="_blank" rel="noopener noreferrer" className="text-black text-decoration-none">
                            Powered by ergast F1 API
                        </a>
                    </Link>
                </h5>
            </div>
        )
    }
}