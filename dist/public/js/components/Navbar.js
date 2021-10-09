"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const react_1 = tslib_1.__importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const king_black_svg_1 = tslib_1.__importDefault(require("../../assets/player/king_black.svg"));
// const ChessNavbar = ({ authenticator }) => {
//     authenticator.subscribe(this)
//     let logo = <img
//                     src={Logo}
//                     width="30"
//                     height="30"
//                     className="d-inline-block align-top"
//                     alt="4D Chess logo"
//                 />;
//     return (
//         <Navbar className="navbar-custom" sticky="top" expand="lg">
//             <Navbar.Brand href="#home">
//                 <strong>4D Chess</strong> <span className='beta'>Beta</span>
//             </Navbar.Brand>
//             <Navbar.Toggle aria-controls="basic-navbar-nav" />
//             <Navbar.Collapse id="basic-navbar-nav">
//                 <Nav className="mr-auto">
//                 {this.props.loggedIn ? '' : <Button href="#/login" variant="outline-dark">Log In</Button>}
//                 {this.props.loggedIn ? '' : <Button href="#/register" variant="outline-dark">Sign Up</Button>}
//                 <Nav.Link href="#/play">Play</Nav.Link>
//                 <Nav.Link href="#/home#leaderboards">Leaderboards</Nav.Link>
//                 <NavDropdown title="Other Stuff" id="basic-nav-dropdown">
//                     <NavDropdown.Item href="#/about">About</NavDropdown.Item>
//                     <NavDropdown.Item href="#/suggest">Suggest a Feature</NavDropdown.Item>
//                     <NavDropdown.Item href="#/bug">Report a Bug</NavDropdown.Item>
//                     <NavDropdown.Divider />
//                     <NavDropdown.Item href="#/patron">Support 4D Chess</NavDropdown.Item>
//                 </NavDropdown>
//                 {this.props.loggedIn ? <Nav.Link href="#/logout">Logout</Nav.Link> : ''}
//                 </Nav>
//                 {/* <Form ieturn nline>
//                     <FormControl type="text" placeholder="Search" className="mr-sm-2" />
//                     <Button variant="outline-dark">Search</Button>
//                 </Form> */}
//             </Navbar.Collapse>
//         </Navbar>
//     );
// }
class ChessNavbar extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = props;
        this.props.stateHelper.onStateChange((state) => { this.setState(state); });
    }
    render() {
        let logo = <img src={king_black_svg_1.default} width="30" height="30" className="d-inline-block align-top" alt="4D Chess logo"/>;
        return (<react_bootstrap_1.Navbar className="navbar-custom" sticky="top" expand="lg">
                <react_bootstrap_1.Navbar.Brand href="#home">
                    <strong>4D Chess</strong> <span className='beta'>Beta</span>
                </react_bootstrap_1.Navbar.Brand>
                <react_bootstrap_1.Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <react_bootstrap_1.Navbar.Collapse id="basic-navbar-nav">
                    <react_bootstrap_1.Nav className="mr-auto">
                    {this.state.loggedIn ? '' : <react_bootstrap_1.Button href="#/login" variant="outline-dark">Log In</react_bootstrap_1.Button>}
                    {this.state.loggedIn ? '' : <react_bootstrap_1.Button href="#/register" variant="outline-dark">Sign Up</react_bootstrap_1.Button>}
                    <react_bootstrap_1.Nav.Link href="#/play">Play</react_bootstrap_1.Nav.Link>
                    <react_bootstrap_1.Nav.Link href="#/home#leaderboards">Leaderboards</react_bootstrap_1.Nav.Link>
                    <react_bootstrap_1.NavDropdown title="Other Stuff" id="basic-nav-dropdown">
                        <react_bootstrap_1.NavDropdown.Item href="#/about">About</react_bootstrap_1.NavDropdown.Item>
                        <react_bootstrap_1.NavDropdown.Item href="#/suggest">Suggest a Feature</react_bootstrap_1.NavDropdown.Item>
                        <react_bootstrap_1.NavDropdown.Item href="#/bug">Report a Bug</react_bootstrap_1.NavDropdown.Item>
                        <react_bootstrap_1.NavDropdown.Divider />
                        <react_bootstrap_1.NavDropdown.Item href="#/patron">Support 4D Chess</react_bootstrap_1.NavDropdown.Item>
                    </react_bootstrap_1.NavDropdown>
                    {this.props.loggedIn ? <react_bootstrap_1.Nav.Link href="#/logout">Logout</react_bootstrap_1.Nav.Link> : ''}
                    </react_bootstrap_1.Nav>
                    
                </react_bootstrap_1.Navbar.Collapse>
            </react_bootstrap_1.Navbar>);
    }
}
exports.default = ChessNavbar;
//# sourceMappingURL=Navbar.js.map