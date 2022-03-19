import React from 'react'
import {StyledAbsoluteLink} from "../topBarCss";
import NavDropdown from "./NavDropdown";

interface NavItemProps {
	navItem: any
}

const NavItem: React.FC<NavItemProps> = ({navItem}) => {

	switch(navItem.type) {
		case 'link':
			return <StyledAbsoluteLink href={navItem.link}>{navItem.title}</StyledAbsoluteLink>;

		case 'dropdown':
			return <NavDropdown navItem={navItem} />
	}
};

export default NavItem