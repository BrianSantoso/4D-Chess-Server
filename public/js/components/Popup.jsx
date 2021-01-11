import React, { Component } from 'react';
import { Modal, Button } from 'react-bootstrap';
class Popup extends Component {
    render() {
        return (
            <PopupBg handleExit={this.props.handleExit}>
                <div className='popup' onClick={(e) => e.stopPropagation()}>
                    {this.props.children}
                </div>
            </PopupBg>
        );
    }
}

class PopupBg extends Component {
    render() {
        return (
            <div className='popup-bg-overlay' onClick={this.props.handleExit}>
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