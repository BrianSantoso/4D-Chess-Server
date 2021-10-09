"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const react_1 = tslib_1.__importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
class Leaderboard extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            headers: ['Rank', 'Username', 'Elo'],
            rows: [
                [1, 'bman', 1200],
                [2, 'bman2', 1000],
                [3, 'bman3', 1000],
                [4, 'bman4', 1000],
                [5, 'bman5', 1000],
                [6, 'bman6', 1000],
                [7, 'bman7', 1000],
                [8, 'bman8', 1000],
                [9, 'bman9', 1000]
            ]
        };
    }
    render() {
        return (<react_bootstrap_1.Table striped bordered hover id='leaderboards'>
                <thead>
                    <tr>
                        {this.state.headers.map((title, index) => <th key={index}>{title}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {this.state.rows.map((row, rank) => {
            return <tr key={rank}>
                            {row.map((item, key) => {
                return <td key={key}>{item}</td>;
            })}
                        </tr>;
        })}
                </tbody>
            </react_bootstrap_1.Table>);
    }
}
exports.default = Leaderboard;
//# sourceMappingURL=Leaderboard.js.map