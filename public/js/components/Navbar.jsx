
import React, { Component } from 'react';
import { Navbar, Nav, NavDropdown, Form, FormControl, Button } from 'react-bootstrap';
import Logo from '../../assets/player/king_black.svg';

class ChessNavbar extends Component {

    render() {
        let logo = <img
                        src={Logo}
                        width="30"
                        height="30"
                        className="d-inline-block align-top"
                        alt="4D Chess logo"
                    />
        return (
            <Navbar className="navbar-custom" sticky="top" expand="lg">
                <Navbar.Brand href="#home">
                    <strong>4D Chess</strong> <span className='beta'>Beta</span>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                    {this.props.loggedIn ? '' : <Button href="#/login" variant="outline-dark">Log In</Button>}
                    {this.props.loggedIn ? '' : <Button href="#/register" variant="outline-dark">Sign Up</Button>}
                    <Nav.Link href="#/play">Play</Nav.Link>
                    <Nav.Link href="#/leaderboards">Leaderboards</Nav.Link>
                    <NavDropdown title="Other Stuff" id="basic-nav-dropdown">
                        <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                        <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                        <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                    </NavDropdown>
                    {this.props.loggedIn ? <Nav.Link href="#/logout">Logout</Nav.Link> : ''}
                    </Nav>
                    <Form inline>
                    <FormControl type="text" placeholder="Search" className="mr-sm-2" />
                    <Button variant="outline-dark">Search</Button>
                    </Form>
                </Navbar.Collapse>
            </Navbar>
        );
    }

    // render() {
    //     return (
    //         <nav className="navbar navbar-light bg-light navbar-expand-lg">
    //             <Link to="/" className="navbar-brand">4D Chess</Link>
    //             <div className="collpase navbar-collapse">
    //                 <ul className="navbar-nav mr-auto">
    //                     <li className="navbar-item">
    //                         <Link to="/register" className="nav-link">Sign Up</Link>
    //                     </li>
    //                 </ul>
    //             </div>
    //         </nav>
    //     );
    // }
}

export default ChessNavbar;