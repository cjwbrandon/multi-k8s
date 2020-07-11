import React, { Component } from 'react';
import axios from 'axios';

class Fib extends Component {
    // variables
    state = {
        seenIndexes: [],
        values: {},
        index: ''
    };

    // Fetch data from backend API
    // DidMount lifecyle method
    componentDidMount() {
        this.fetchValues();
        this.fetchIndexes();
    }

    // Data fetching - for redis
    async fetchValues() {
        const values = await axios.get('/api/values/current');
        this.setState({ values: values.data });
    }

    // Data fetching - for postgres (indices)
    async fetchIndexes() {
        const seenIndexes = await axios.get('/api/values/all');
        this.setState({
            seenIndexes: seenIndexes.data
        });
    }


    // Render helper functions
    // Submit index to calculate
    handleSubmit = async (event) => {
        event.preventDefault();

        await axios.post('/api/values', {
            index: this.state.index
        });
        this.setState({ index: '' });
    };


    // Pulling indexes from Postgres
    renderSeenIndexes() {
        return this.state.seenIndexes.map(({ number }) => number).join(', '); // pulling out the numbers from the array
    }

    // Calculated values from Redis
    // Recall - data from Redis is some hash map object
    renderValues() {
        const entries = [];

        for (let key in this.state.values) {
            entries.push(
                <div key={key}>
                    For index {key} I calculated {this.state.values[key]}
                </div>
            );
        }

        return entries;
    }

    // Rendering data
    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>Enter your index:</label>
                    <input
                        value={this.state.index}
                        onChange={event => this.setState({ index: event.target.value })}
                    />
                    <button>Submit</button>
                </form>

                <h3>Indexes I have seen:</h3>
                {this.renderSeenIndexes()}

                <h3>Calculated Values:</h3>
                {this.renderValues()}
            </div>
        )
    }
}

export default Fib;
