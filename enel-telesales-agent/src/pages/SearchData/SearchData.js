import React, { Component } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import { Select, Text } from 'components/form';
import MainLayout from 'layouts/MainLayout';
import { Form } from 'components/form';
import { Button } from 'components/Button';
import { getData } from 'store/search-data/selectors';
import { searchData } from 'store/search-data/actions';
import _ from 'lodash';
import MultiPlacesModal from 'components/modals/MultiPlacesModal';
import './SearchData.scss';
import Loader from 'components/Loader';

class SearchData extends Component {
    state = {
        cities: [],
        code: '',
        error: '',
        modalMessage: '',
        type: null,
        loading: false,
    };

    numbersOfPlacesModal = React.createRef();

    constructor(props) {
        super(props);
        autoBind(this);
    }

    async componentDidMount() {}

    setFormApi(formApi) {
        this.formApi = formApi;
    }

    async handleSearchClick(e) {}

    renderSearchError() {
        if (this.state.error) {
            return <div className="error-msg">{this.state.error}</div>;
        }
    }

    async handleCountyChange(e) {
        this.formApi.setValues({
            loc_localitate: '',
        });
    }

    async handleSumbit(e) {
        e.preventDefault();
        const { type, county, city, code } = this.formApi.getState().values;
        this.setState({ loading: true });
        await this.props.searchData(type, code);
        this.setState({ loading: false, type: type });
    }

    // upperCase = e => {
    //     e.preventDefault();
    //     this.formApi.setValue('pod_clc', e.target.value.toUpperCase());
    // };

    render() {
        const { type, code } = this.formApi ? this.formApi.getState().values : {};
        let modalMessage = '';
        let data;
        if (this.props.data) {
            debugger;
            data = this.props.data;
        }

        return (
            <MainLayout>
                <MultiPlacesModal title={this.state.modalMessage} ref={this.numbersOfPlacesModal} />
                <div className="SearchPlace wrapper searchplace-page view-searchpalce-form">
                    <div className="search-form">
                        <Form getApi={this.setFormApi}>
                            {this.renderSearchError()}
                            <fieldset>
                                <h3>CAUTARE SALESFORCE</h3>
                                <div className="input-wrapper">
                                    <div className="row">
                                        <Select
                                            className="col-md-6"
                                            label="Cautare dupa"
                                            name="type"
                                            options={[
                                                { value: 'CNPCUI', label: 'CNP/CUI' },
                                                { value: 'COD_CLIENT', label: 'Cod client' },
                                                { value: 'POD', label: 'POD' },
                                                { value: 'PHONE', label: 'Numar telefon' },
                                            ]}
                                            autoComplete="new-type"
                                        />
                                        <Text
                                            className="col-md-6"
                                            label="Cod"
                                            name="code"
                                            type="text"
                                            autoComplete="new-pod_clc"
                                        />
                                    </div>
                                </div>
                                {this.state.loading ? (
                                    <></>
                                ) : (
                                    <Button
                                        primary
                                        value="Cautare"
                                        id="search-btn"
                                        onClick={this.handleSumbit}
                                        disablePrevent
                                    />
                                )}
                            </fieldset>
                        </Form>
                    </div>
                    {this.state.loading ? (
                        <div className="row">
                            <div className="col-12">
                                <div className="loaderIndicator">
                                    <Loader show />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <></>
                    )}
                    {data?.Accounts !== undefined && data?.Accounts !== null ? (
                        !Array.isArray(data?.Accounts) ? (
                            <div>
                                <div className="row">
                                    <div className="data">
                                        <div className="row">
                                            <div className="col-md-3 label">Cod Client</div>
                                            <div className="col-md-3 label">Nume Client</div>
                                            {type !== 'PHONE' ? (
                                                <div className="col-md-3 label">Don't Market</div>
                                            ) : (
                                                <></>
                                            )}
                                            {type !== 'PHONE' ? (
                                                <div className="col-md-3 label">
                                                    Don't Market with Parteners
                                                </div>
                                            ) : (
                                                <></>
                                            )}
                                        </div>
                                        <div className="row">
                                            <div className="col-md-3 label">
                                                {data.Accounts.cod_client}
                                            </div>
                                            <div className="col-md-3 label">
                                                {data.Accounts.nume_client}
                                            </div>
                                            {type !== 'PHONE' ? (
                                                <div className="col-md-3 label">
                                                    {data.Accounts.dont_market}
                                                </div>
                                            ) : (
                                                <></>
                                            )}
                                            {type !== 'PHONE' ? (
                                                <div className="col-md-3 label">
                                                    {data.Accounts.dont_market_with_partner}
                                                </div>
                                            ) : (
                                                <></>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {type !== 'PHONE' ? (
                                    <div className="row">
                                        <div className="data">
                                            <div className="row">
                                                <div className="col-md-2 label">POD Code</div>
                                                <div className="col-md-2 label">Status</div>
                                                <div className="col-md-1 label">Piata</div>
                                                <div className="col-md-2 label">
                                                    ContractEndDate
                                                </div>
                                                <div className="col-md-2 label">Produs</div>
                                                <div className="col-md-1 label">Record Type</div>
                                                <div className="col-md-1 label">Abonament</div>
                                                <div className="col-md-1 label">Energie Activa</div>
                                            </div>
                                        </div>
                                        <div className="data">
                                            {Array.isArray(data.Accounts.Supply) ? (
                                                data.Accounts.Supply.map(el => {
                                                    return (
                                                        <div className="row">
                                                            <div className="col-md-2 label">
                                                                {el.pod_code}
                                                            </div>
                                                            <div className="col-md-2 label">
                                                                {el.status}
                                                            </div>
                                                            <div className="col-md-1 label">
                                                                {el.piata}
                                                            </div>
                                                            <div className="col-md-2 label">
                                                                {el.contractEndDate}
                                                            </div>
                                                            <div className="col-md-2 label">
                                                                {el.produs}
                                                            </div>
                                                            <div className="col-md-1 label">
                                                                {el.record_type}
                                                            </div>
                                                            <div className="col-md-1 label">
                                                                {el.abonament}
                                                            </div>
                                                            <div className="col-md-1 label">
                                                                {el.energie_activa}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : data.Accounts.Supply ? (
                                                <div className="row">
                                                    <div className="col-md-2 label">
                                                        {data.Accounts.Supply.pod_code}
                                                    </div>
                                                    <div className="col-md-2 label">
                                                        {data.Accounts.Supply.status}
                                                    </div>
                                                    <div className="col-md-1 label">
                                                        {data.Accounts.Supply.piata}
                                                    </div>
                                                    <div className="col-md-2 label">
                                                        {data.Accounts.Supply.contractEndDate}
                                                    </div>
                                                    <div className="col-md-2 label">
                                                        {data.Accounts.Supply.produs}
                                                    </div>
                                                    <div className="col-md-1 label">
                                                        {data.Accounts.Supply.record_type}
                                                    </div>
                                                    <div className="col-md-1 label">
                                                        {data.Accounts.Supply.abonament}
                                                    </div>
                                                    <div className="col-md-1 label">
                                                        {data.Accounts.Supply.energie_activa}
                                                    </div>
                                                </div>
                                            ) : (
                                                <></>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <></>
                                )}
                                {/* <div className="row">
                                <div className="data">
                                    <div className="row">
                                        <div className="col-md-3 label">Cod Client</div>
                                        <div className="col-md-3 label">Nume Client</div>
                                    </div>
                                </div>
                            </div> */}
                            </div>
                        ) : (
                            data?.Accounts.map(e => {
                                return (
                                    <div>
                                        <div className="row">
                                            <div className="data">
                                                <div className="row">
                                                    <div className="col-md-3 label">Cod Client</div>
                                                    <div className="col-md-3 label">
                                                        Nume Client
                                                    </div>
                                                    {type !== 'PHONE' ? (
                                                        <div className="col-md-3 label">
                                                            Don't Market
                                                        </div>
                                                    ) : (
                                                        <></>
                                                    )}
                                                    {type !== 'PHONE' ? (
                                                        <div className="col-md-3 label">
                                                            Don't Market with Parteners
                                                        </div>
                                                    ) : (
                                                        <></>
                                                    )}
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-3 label">
                                                        {e.cod_client}
                                                    </div>
                                                    <div className="col-md-3 label">
                                                        {e.nume_client}
                                                    </div>
                                                    {type !== 'PHONE' ? (
                                                        <div className="col-md-3 label">
                                                            {e.dont_market}
                                                        </div>
                                                    ) : (
                                                        <></>
                                                    )}
                                                    {type !== 'PHONE' ? (
                                                        <div className="col-md-3 label">
                                                            {e.dont_market_with_partner}
                                                        </div>
                                                    ) : (
                                                        <></>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {type !== 'PHONE' ? (
                                            <div className="row">
                                                <div className="data">
                                                    <div className="row">
                                                        <div className="col-md-2 label">
                                                            POD Code
                                                        </div>
                                                        <div className="col-md-2 label">Status</div>
                                                        <div className="col-md-1 label">Piata</div>
                                                        <div className="col-md-2 label">
                                                            ContractEndDate
                                                        </div>
                                                        <div className="col-md-2 label">Produs</div>
                                                        <div className="col-md-1 label">
                                                            Record Type
                                                        </div>
                                                        <div className="col-md-1 label">
                                                            Abonament
                                                        </div>
                                                        <div className="col-md-1 label">
                                                            Energie Activa
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="data">
                                                    {Array.isArray(e.Supply) ? (
                                                        e.Supply.map(el => {
                                                            return (
                                                                <div className="row">
                                                                    <div className="col-md-2 label">
                                                                        {el.pod_code}
                                                                    </div>
                                                                    <div className="col-md-2 label">
                                                                        {el.status}
                                                                    </div>
                                                                    <div className="col-md-1 label">
                                                                        {el.piata}
                                                                    </div>
                                                                    <div className="col-md-2 label">
                                                                        {el.contractEndDate}
                                                                    </div>
                                                                    <div className="col-md-2 label">
                                                                        {el.produs}
                                                                    </div>
                                                                    <div className="col-md-1 label">
                                                                        {el.record_type}
                                                                    </div>
                                                                    <div className="col-md-1 label">
                                                                        {el.abonament}
                                                                    </div>
                                                                    <div className="col-md-1 label">
                                                                        {el.energie_activa}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    ) : e.Supply ? (
                                                        <div className="row">
                                                            <div className="col-md-2 label">
                                                                {e.Supply.pod_code}
                                                            </div>
                                                            <div className="col-md-2 label">
                                                                {e.Supply.status}
                                                            </div>
                                                            <div className="col-md-1 label">
                                                                {e.Supply.piata}
                                                            </div>
                                                            <div className="col-md-2 label">
                                                                {e.Supply.contractEndDate}
                                                            </div>
                                                            <div className="col-md-2 label">
                                                                {e.Supply.produs}
                                                            </div>
                                                            <div className="col-md-1 label">
                                                                {e.Supply.record_type}
                                                            </div>
                                                            <div className="col-md-1 label">
                                                                {e.Supply.abonament}
                                                            </div>
                                                            <div className="col-md-1 label">
                                                                {e.Supply.energie_activa}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <></>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <></>
                                        )}
                                        {/* <div className="row">
                                <div className="data">
                                    <div className="row">
                                        <div className="col-md-3 label">Cod Client</div>
                                        <div className="col-md-3 label">Nume Client</div>
                                    </div>
                                </div>
                            </div> */}
                                    </div>
                                );
                            })
                        )
                    ) : data?.WSResponse ? (
                        <>{'Pentru valoarea cautata nu exista date!'}</>
                    ) : (
                        <></>
                    )}
                </div>
            </MainLayout>
        );
    }
}

const mapStateToProps = state => ({
    data: getData(state),
});

const mapDispatchToProps = {
    searchData,
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchData);
