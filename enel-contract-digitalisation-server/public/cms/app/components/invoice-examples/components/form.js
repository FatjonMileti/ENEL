import React from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import _ from 'lodash';
import api from '../../../api/index.js';

class InvoiceExamplesForm extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.props.initCounties();
        this.props.initProviders();
    }

    render() {
        return (
            <div className="box add-users-box">
                <form className="form">
                    <div className="form-row">
                        <p className="input-box-field active">
                            <label>Type</label>
                            <select name="type" value={this.props.input.type} onChange={this.props.onChange} disabled={this.props.disabled}>
                                <option value="">Any</option>
                                <option value="EE">EE</option>
                                <option value="GAZ">GAZ</option>
                            </select>
                        </p>
                        <p className="input-box-field active">
                            <label>Provider</label>
                            <select name="furnizor_id" value={this.props.input.furnizor_id} onChange={this.props.onChange} disabled={this.props.disabled}>
                                <option value="">Any</option>
                                {_.map(this.props.providers, provider => (
                                    <option value={provider.internal_id} key={provider.internal_id}>{provider.denumire}</option>
                                ))}
                            </select>
                        </p>
                    </div>
                    <div className="form-row">
                        <p className="input-box-field active">
                            <label>County</label>
                            <select name="county" value={this.props.input.county} onChange={this.props.onChange} disabled={this.props.disabled}>
                                <option value="">Any</option>
                                {_.map(this.props.counties, county => (
                                    <option value={county.denumire} key={county.denumire}>{county.denumire}</option>
                                ))}
                            </select>
                        </p>
                        <p className="input-box-field active">
                            <label>Market</label>
                            <select name="market" value={this.props.input.market} onChange={this.props.onChange} disabled={this.props.disabled}>
                                <option value="">Any</option>
                                <option value="PR">PR</option>
                                <option value="PL">PL</option>
                            </select>
                        </p>
                    </div>
                </form>
            </div>
        );
    }
}

export default connect(state => {
    return {
        providers: state.provider.data,
        counties: state.county.data,
    };
}, dispatch => {
    return {
        initCounties: () => {
            return dispatch(async (dispatch, getState) => {
                dispatch({ type: 'COUNTY/LOADING' });
                const counties = await api.county.all();

                dispatch({
                    type: 'COUNTY/ALL',
                    payload: counties,
                });
            });
        },
        initProviders: () => {
            return dispatch(async (dispatch, getState) => {
                dispatch({ type: 'PROVIDER/LOADING' });
                const providers = await api.provider.all();

                dispatch({
                    type: 'PROVIDER/ALL',
                    payload: providers,
                });
            });
        }
    };
})(InvoiceExamplesForm);