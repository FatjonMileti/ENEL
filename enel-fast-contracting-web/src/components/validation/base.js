import { Component } from 'react';
import PropTypes from 'prop-types';
import shallowEqualArrays from 'shallow-equal/arrays';
import shallowEqualObjects from 'shallow-equal/objects';
import { v4 } from 'uuid';

export default class Base extends Component {
  static contextTypes = {
    _register: PropTypes.func.isRequired,
    _unregister: PropTypes.func.isRequired,
    _setProps: PropTypes.func.isRequired,
    _handleChange: PropTypes.func.isRequired,
    _handleBlur: PropTypes.func.isRequired,
    _getProps: PropTypes.func.isRequired
  };

  static propTypes = {
    validations: PropTypes.arrayOf(PropTypes.func),
    onChange: PropTypes.func,
    onBlur: PropTypes.func
  };

  static defaultProps = {
    validations: []
  };

  id = v4();

  componentDidMount() {
    this.context._register(this, this.id);
  }

  componentWillUnmount() {
    this.context._unregister(this, this.id);
  }

  componentWillReceiveProps({ validations: nextValidations, ...nextProps }) {
    const { validations, ...props } = this.props;

    if (!shallowEqualObjects(props, nextProps) || !shallowEqualArrays(validations, nextValidations)) {
      this.context._setProps(nextProps, this.id);
    }
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return nextContext !== this.context;
  }

  handleChange = (event) => {
    if(typeof event.persist === "functiont") event.persist();

    this.context._handleChange(event, this.id);
    this.props.onChange && this.props.onChange(event);
  };

  handleBlur = (event) => {
    if(typeof event.persist === "functiont") event.persist();

    this.context._handleBlur(event, this.id);
    this.props.onBlur && this.props.onBlur(event);
  };

  render() {
    return null;
  }
}
