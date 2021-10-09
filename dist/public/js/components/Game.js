"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const react_1 = tslib_1.__importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
class Game extends react_1.Component {
    constructor(props) {
        super(props);
        this._root = null; // element to mount game's view onto.
        this.state = props;
        this.props.stateHelper.onStateChange((state) => { this.setState(state); });
    }
    componentDidMount() {
        // Mount three.js canvas
        this.state.gameManager.mount(this._root);
    }
    componentDidUpdate() {
        this.render();
    }
    render() {
        // TODO: make ClientGameManager have a single View2D that contains both canvas and gui overlay.
        // make SceneManager have View2D that wraps threejs canvas. (might be difficult since not react component)
        const maximized = this.state.focusState.maximized();
        const className = maximized ? 'embed-maximized' : 'embed-minimized';
        return (<div id="embedPositioner">
				<div id="embed" className={className} ref={(ref) => (this._root = ref)}>
					{maximized ?
            this.state.gameManager.view2D()
            :
                <react_router_dom_1.Link className='overlay clickable click-to-maximize' to="/play"></react_router_dom_1.Link>}
				</div>
			</div>);
    }
}
exports.default = Game;
//# sourceMappingURL=Game.js.map