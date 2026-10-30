import React from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';

import { request, logout } from '../../api/index.js';
import InvoiceExamplesForm from './components/form.js';
import ImageHandler from './components/imageHandler.js';
import api from '../../api/index.js';

class InvoiceExamplesEdit extends React.Component {
    state = {
        loaded: false,
        form: {
            type: '',
            furnizor_id: '',
            county: '',
            market: '',
        },
    }

    constructor(props) {
        super(props);
        autoBind(this);
    }

    async componentWillUnmount() {
        await this.props.unsetCurrentInvoiceGroup();
    }

    async componentDidMount() {
        const { currentInvoiceGroup } = this.props;
        if (currentInvoiceGroup) {
            this.setState({
                form: {
                    type: currentInvoiceGroup.type,
                    furnizor_id: currentInvoiceGroup.provider,
                    county: currentInvoiceGroup.county,
                    market: currentInvoiceGroup.market,
                }
            }, async () => {
                await this.props.initInvoiceExamples(this.state.form);
                this.setState({ loaded: true });
            });
        } else {
            this.props.history.push('/invoice-examples');
        }
    }

    async handleImageAdd(file, codeType) {
        await this.props.uploadInvoiceImage(file, Object.assign(JSON.parse(JSON.stringify(this.state.form)), {
            code_type: codeType,
        }));
        this.props.initInvoiceExamples(this.state.form);
    }

    async handleDelete(e, invoice) {
        e.preventDefault();
        if (invoice && invoice.id) {
            await this.props.deleteInvoice(invoice.id);
            this.props.initInvoiceExamples(this.state.form);
        }
    }

    handleSaveClick(e) {
        e.preventDefault();
        this.props.history.push('/invoice-examples')
    }

    handleFormChange(e) {
        this.setState({
            form: {
                ...this.state.form,
                [e.target.name]: e.target.value,
            }
        }, () => {
            this.props.initInvoiceExamples(this.state.form);
        });
    }
    getInvoices(codeType) {
        if (this.props.invoiceExamples.length > 0) {
            return this.props.invoiceExamples.filter(item => item.code_type == codeType);
        }
        return [];
    } 

    render() {
        return (
            <div className="content">
                <div className="content-box">
                    <div className="content-box-header">
                        <h3>Invoice Examples</h3>
                        <a className="button blue" href="#" onClick={this.handleSaveClick}>
                            Done
                        </a>
                    </div>
                    <div className="content-box-body">
                        <div className="scrollbar">
                            <InvoiceExamplesForm
                                input={this.state.form}
                                onChange={this.handleFormChange}
                                disabled
                            />
                            <ImageHandler
                                title="POD/CLC"
                                invoices={this.getInvoices("POD")}
                                isLoading={this.props.isLoading}
                                onAdd={(file) => this.handleImageAdd(file, "POD")}
                                onDelete={this.handleDelete}
                            />
                            <ImageHandler
                                title="NLC"
                                invoices={this.getInvoices("NLC")}
                                isLoading={this.props.isLoading}
                                onAdd={(file) => this.handleImageAdd(file, "NLC")}
                                onDelete={this.handleDelete}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(state => {
    return {
        invoiceExamples: state.invoice_examples.data,
        currentInvoiceGroup: state.invoice_examples.currentGroup,
        isLoading: state.invoice_examples.isLoading,
    };
}, dispatch => {
    return {
        uploadInvoiceImage: (file, params) => dispatch(async (dispatch, getState) => {
            dispatch({ type: 'INVOICE_EXAMPLES/LOADING' });
            await api.invoice_example.post(file, params);
        }),
        initInvoiceExamples: (params) => dispatch(async (dispatch, getState) => {
            const invoiceExamples = await api.invoice_example.all(params);
            dispatch({ type: 'INVOICE_EXAMPLES/ALL', payload: invoiceExamples });
        }),
        deleteInvoice: (id) => dispatch(async (dispatch, getState) => {
            await api.invoice_example.delete(id);
        }),
        unsetCurrentInvoiceGroup: () => dispatch(async (dispatch, getState) => {
            dispatch({ type: 'INVOICE_EXAMPLES/UNSET_CURRENT_GROUP' });
        }),
    }
})(InvoiceExamplesEdit);