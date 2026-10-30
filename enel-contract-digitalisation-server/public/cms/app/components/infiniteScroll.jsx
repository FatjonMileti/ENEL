import PropTypes from 'prop-types';
import React from 'react';

class InfiniteScroll extends React.Component {
    constructor(props) {
        super(props);

        this.sentinel = React.createRef();
        this.container = React.createRef();
        this.check = this.check.bind(this);

        this.timeout = null;
    }

    check() {
        if (this.timeout)
            clearTimeout(this.timeout);

        this.timeout = setTimeout(() => {
            var { isLoading, hasMore, threshold, onLoadMore } = this.props;
            if (isLoading || !hasMore)
                return;
            var sentinel = this.sentinel.current;
            var fromBottom = sentinel.getBoundingClientRect().top - window.innerHeight;
            if (fromBottom < threshold) {
                onLoadMore();
            }
        }, 300);
    }

    componentDidMount() {
        this.container.current.addEventListener('scroll', this.check);
        this.container.current.addEventListener('resize', this.check);
    }

    componentWillUnmount() {
        if (this.timeout)
            clearTimeout(this.timeout);
            
        this.container.current.removeEventListener('scroll', this.check);
        this.container.current.removeEventListener('resize', this.check);
    }

    render() {
        return (
            <div className={this.props.className} ref={this.container}>
                {this.props.children}
                <div ref={this.sentinel} />
            </div>
        );
    }
}

InfiniteScroll.propTypes = {
    hasMore: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    onLoadMore: PropTypes.func.isRequired,
    threshold: PropTypes.number,
    throttle: PropTypes.number,
    className: PropTypes.string
}

InfiniteScroll.defaultProps = {
    threshold: 100,
    throttle: 64
};

export default InfiniteScroll;