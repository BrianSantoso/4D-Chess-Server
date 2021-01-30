import React, { Component } from 'react';
import { Table } from 'react-bootstrap';

class Leaderboard extends Component {
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
        return (
            <Table striped bordered hover id='leaderboards'>
                <thead>
                    <tr>
                        {this.state.headers.map((title, index) => <th key={index}>{title}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {this.state.rows.map((row, rank) => {
                        return <tr key={rank}>
                            {row.map((item, key) => {
                                return <td key={key}>{item}</td>
                            })}
                        </tr>
                    })}
                </tbody>
            </Table>
        );
    }
}

export default Leaderboard;