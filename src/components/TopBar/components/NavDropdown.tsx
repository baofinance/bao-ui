import React from 'react'
import {Dropdown} from "react-bootstrap";

interface NavDropdownProps {
	navItem: any
}

const NavDropdown: React.FC<NavDropdownProps> = ({navItem}) => {

			return (
				<Dropdown>
					<Dropdown.Toggle variant="dark" id={navItem.title}>{navItem.title}</Dropdown.Toggle>
					<Dropdown.Menu>
						{
							navItem.submenu.map(
								(submenuItem:any, index:any ) => {
									return <Dropdown.Item href={submenuItem.link}>{submenuItem.title}</Dropdown.Item>;
								}
							)
						}
					</Dropdown.Menu>
				</Dropdown>
			)
};

export default NavDropdown