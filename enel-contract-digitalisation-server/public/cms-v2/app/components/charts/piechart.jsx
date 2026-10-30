import React, { Component } from 'react';
import * as d3 from 'd3';

class Arc extends Component {
    constructor(props) {
        super(props);

        this.arc = d3.arc();
    }

    componentWillMount() {
        this.updateD3(this.props);
    }

    componentWillReceiveProps(newProps) {
        this.updateD3(newProps);
    }

    updateD3(newProps) {
        this.arc.innerRadius(newProps.innerRadius);
        this.arc.outerRadius(newProps.outerRadius);
    }

    render() {
        return (
            <path d={this.arc(this.props.data)}
                style={{ fill: this.props.color }}></path>
        );
    }
}

class Piechart extends Component {
    constructor(props) {
        super(props);

        this.pie = d3.pie()
            .value((d) => d);
        this.colors = d3.scaleOrdinal(props.colors);
    }

    arcGenerator(d, i) {
        return (
            <Arc key={`arc-${i}`}
                data={d}
                innerRadius={this.props.innerRadius}
                outerRadius={this.props.outerRadius}
                color={this.colors(i)} />
        );
    }

    render() {
        let pie = this.pie(this.props.data),
            translate = `translate(${this.props.x}, ${this.props.y})`;

        return (
            <svg viewBox="0 0 100 100">
                <g transform={translate}>
                    {pie.map((d, i) => this.arcGenerator(d, i))}
                </g>
            </svg>
        );
    }
}

export default Piechart;