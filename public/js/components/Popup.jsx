import React, { Component } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { CSSTransitionGroup } from 'react-transition-group';
import { Redirect } from 'react-router-dom';
class Popup extends Component {
    render() {
        return (
                <PopupBg redirect={this.props.redirect}>
                    <div className='popup' onClick={(e) => e.stopPropagation()}>
                        {this.props.children}
                    </div>
                </PopupBg>
        );
    }
}

class PopupBg extends Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: null
        }
        this.onExit = this.onExit.bind(this);
    }
    onExit() {
        this.setState({
            redirect: this.props.redirect
        });
    }
    render() {
        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }
        return (
            <div className='popup-bg-overlay' onClick={this.onExit}>
                {this.props.children}
            </div>
        );
    }
}

// class Popup extends Component {
//     render() {
//         return(
//             <Modal.Dialog>
//                 <Modal.Header closeButton>
//                     <Modal.Title>Modal title</Modal.Title>
//                 </Modal.Header>

//                 <Modal.Body>
//                     <p>Modal body text goes here.</p>
//                 </Modal.Body>

//                 <Modal.Footer>
//                     <Button variant="secondary">Close</Button>
//                     <Button variant="primary">Save changes</Button>
//                 </Modal.Footer>
//             </Modal.Dialog>
//         );
//     }
// }

export default Popup;