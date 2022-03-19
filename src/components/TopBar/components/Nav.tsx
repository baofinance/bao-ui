import React from 'react'
import {navItems} from "./navItems";
import NavItem from "./NavItem";
import {StyledNav} from "../topBarCss";

const Nav: React.FC = () => {
	return (
		<StyledNav>
			{
				navItems.map(
					(navItem, index) => {
						return <NavItem navItem={navItem} />
					}
				)
			}
		</StyledNav>
	);
};

export default Nav