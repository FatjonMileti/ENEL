/* eslint-disable linebreak-style */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Text as TextInput } from 'components/form';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import { validateVoucher } from 'store/voucher/actions';
import { getItem } from 'store/voucher/selectors';
import { Button } from 'components/Button';
import autoBind from 'react-autobind';
import { Checkbox, Text } from 'components/form';
import { Form } from 'components/form';
import ErrorModal from 'components/modals/ErrorModal';
import VoucherModal from 'components/modals/VoucherModal';
import { getSession } from 'store/session/selectors';
import { checkForm, getFromForm, noFormErrors, resetFormErrors } from 'services/form';
import { requiredEnelTel, required } from '../../../../services/rules';
import _ from 'lodash';

const HtmlTooltip = withStyles(theme => ({
    tooltip: {
        backgroundColor: theme.palette.common.white,
        color: 'rgba(0, 0, 0, 0.87)',
        boxShadow: theme.shadows[1],
        fontSize: 14,
    },
}))(Tooltip);

class Voucher extends Component {
    importErrorModal = React.createRef();
    voucherModal = React.createRef();
    constructor(props) {
        super(props);
        autoBind(this);
    }

    state = {
        // voucher: null,
        isValid: true,
        errorModal: null,
        voucherSelected: false,
        friendsInVoucher: [],
    };

    validateVoucher = input => async () => {
        const { values } = this.formApi.getState();
        await this.validate();
        if (!this.isValid()) return;
        const voucherCode = values[input];
        const voucherEnelTel = values['eneltel_0'];
        this.formApi.setValue('eneltel', voucherEnelTel);
        this.formApi.setValue('voucheCode', voucherCode);
        const flow = _.isEmpty(this.props.session.ee_loc) ? 'gaz' : 'ee';
        let product;
        let judet;
        let cityId;
        try {
            product = this.props.session[`${flow}_serviciu`];
            judet = this.props.session['judet'];
            cityId = this.props.session[`${flow}_loc`]['localitate'];
        } catch (error) {}
        await this.props.validateVoucher(
            voucherCode,
            product.tip,
            product.denumire,
            product.seg,
            judet,
            cityId,
            this.state.voucherSelected,
            voucherEnelTel
        );
        if (this.props.voucher.error) {
            this.setState({
                errorModal: this.props.voucher.error,
            });
            this.importErrorModal.current.show();
        } else {
            this.voucherModal.current.show();
        }
    };

    isValid() {
        return this.state.isValid && noFormErrors(this);
    }

    async validate() {
        await resetFormErrors(this);
        await checkForm(this);
    }

    setFormApi(formApi) {
        this.formApi = formApi;
    }

    toggleCheckbox(e) {
        this.setState({ voucherSelected: !this.state.voucherSelected });
    }

    render() {
        const { getApi } = this.props;
        return (
            <div>
                <ErrorModal
                    title=""
                    confirmLabel="OK"
                    errors={[this.state.errorModal]}
                    ref={this.importErrorModal}
                    onHide={this.handleImportErrorHide}
                />
                <VoucherModal
                    confirmLabel="OK"
                    voucher={this.props.voucher}
                    ref={this.voucherModal}
                    onHide={this.handleImportErrorHide}
                />
                <Form
                    autoComplete="off"
                    getApi={formApi => {
                        getApi(formApi);
                        this.setFormApi(formApi);
                    }}
                >
                    {/* {this.props.voucher.voucher_id ? '' : (<div className="row">
                        <TextInput
                            className="col-md-8"
                            type="text"
                            label="Voucher code"
                            name={`voucher_${this.props.id}`}
                        />
                        <div className="col-md-4">
                            <Button
                                secondary
                                fullWidth
                                value="Valideaza"
                                onClick={this.validateVoucher(`voucher_${this.props.id}`)}
                            />
                        </div>
                    </div>)} */}
                    <div className="row">
                        <TextInput
                            className={`col-md-${this.state.voucherSelected ? '4' : '8'}`}
                            type="text"
                            label="Voucher code"
                            validate={required}
                            name={`voucher_${this.props.id}`}
                        />
                        {this.state.voucherSelected ? (
                            <div className="col-md-4">
                                <div className="checkbox-wrapper">
                                    <TextInput
                                        className="col-md-12"
                                        type="text"
                                        label={`${
                                            _.isEmpty(this.props.session.ee_loc)
                                                ? 'GAZTEL'
                                                : 'ELECTEL'
                                        }`}
                                        validate={requiredEnelTel}
                                        required={this.state.voucherSelected}
                                        name={`eneltel_${this.props.id}`}
                                    />
                                    {/* <BringFriend getApi={this.props.getApi} /> */}
                                </div>
                            </div>
                        ) : (
                            <div></div>
                        )}
                        <div className="col-md-4">
                            <Button
                                secondary
                                fullWidth
                                value="Valideaza"
                                onClick={this.validateVoucher(`voucher_${this.props.id}`)}
                            />
                        </div>
                    </div>
                    {/* {this.props.voucher.voucher_id ? ( */}
                    <div className="row">
                        <div className="col-md-12">
                            <div className="checkbox-wrapper">
                                <Checkbox
                                    name={`voucher_selected`}
                                    onClick={this.toggleCheckbox}
                                    display
                                    label={`Ofera voucher unui prieten (completeaza codul ${
                                        _.isEmpty(this.props.session.ee_loc) ? 'GazTel' : 'ElecTel'
                                    } al prietenului)`}
                                    checked={this.state.voucherSelected}
                                />
                            </div>
                        </div>
                    </div>
                    {/* <div className="row">
                        <div className="col-md-12">
                            <div className="checkbox-wrapper">
                                <BringFriend getApi={this.props.getApi} />
                            </div>
                        </div>
                    </div> */}
                    {/* ) : (
                        ''
                    )} */}
                    {!!this.state.voucher?.targeted && <div className="row"></div>}
                </Form>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    voucher: getItem(state),
    session: getSession(state),
});

const mapDispatchToProps = {
    validateVoucher,
};

export default connect(mapStateToProps, mapDispatchToProps)(Voucher);
