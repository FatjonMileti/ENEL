import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
//import { Test } from './Gradinet.styles';

class Gradinet extends PureComponent { 
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  componentWillMount = () => {
    console.log('Gradinet will mount');
  }

  componentDidMount = () => {
    console.log('Gradinet mounted');
  }

  componentWillReceiveProps = (nextProps) => {
    console.log('Gradinet will receive props', nextProps);
  }

  componentWillUpdate = (nextProps, nextState) => {
    console.log('Gradinet will update', nextProps, nextState);
  }

  componentDidUpdate = () => {
    console.log('Gradinet did update');
  }

  componentWillUnmount = () => {
    console.log('Gradinet will unmount');
  }

  render () {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return (
        <div className="Example" style={{width: 1728, height: 330, position: 'relative', background: 'black'}}>
        <div className="GradientLineHorizontal" style={{width: 254, height: 156, left: 0, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: '0 0', background: 'linear-gradient(90deg, black 0%, #163FE8 51%, #7DA7FF 100%)'}} />
        <div className="GradientLineHorizontal" style={{width: 304, height: 157, left: 156, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: '0 0', background: 'linear-gradient(90deg, black 0%, #163FE8 51%, #7DA7FF 100%)'}} />
        <div className="GradientLineHorizontal" style={{width: 355, height: 158, left: 313, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: '0 0', background: 'linear-gradient(90deg, black 0%, #163FE8 51%, #7DA7FF 100%)'}} />
        <div className="GradientLineHorizontal" style={{width: 405, height: 157, left: 471, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: '0 0', background: 'linear-gradient(90deg, black 0%, #163FE8 51%, #7DA7FF 100%)'}} />
        <div className="GradientLineHorizontal" style={{width: 453, height: 157, left: 628, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: '0 0', background: 'linear-gradient(90deg, black 0%, #163FE8 51%, #7DA7FF 100%)'}} />
        <div className="GradientLineHorizontal" style={{width: 504, height: 157, left: 785, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: '0 0', background: 'linear-gradient(90deg, black 0%, #163FE8 51%, #7DA7FF 100%)'}} />
        <div className="GradientLineHorizontal" style={{width: 553, height: 157, left: 942, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: '0 0', background: 'linear-gradient(90deg, black 0%, #163FE8 51%, #7DA7FF 100%)'}} />
        <div className="GradientLineHorizontal" style={{width: 603, height: 157, left: 1099, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: '0 0', background: 'linear-gradient(90deg, black 0%, #163FE8 51%, #7DA7FF 100%)'}} />
        <div className="GradientLineHorizontal" style={{width: 654, height: 158, left: 1256, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: '0 0', background: 'linear-gradient(90deg, black 0%, #163FE8 51%, #7DA7FF 100%)'}} />
        <div className="GradientLineHorizontal" style={{width: 704, height: 157, left: 1414, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: '0 0', background: 'linear-gradient(90deg, black 0%, #163FE8 51%, #7DA7FF 100%)'}} />
        <div className="GradientLineHorizontal" style={{width: 754, height: 157, left: 1571, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: '0 0', background: 'linear-gradient(90deg, black 0%, #163FE8 51%, #7DA7FF 100%)'}} />
      </div>
    );
  }
}

Gradinet.propTypes = {
  // bla: PropTypes.string,
};

Gradinet.defaultProps = {
  // bla: 'test',
};

export default Gradinet;
