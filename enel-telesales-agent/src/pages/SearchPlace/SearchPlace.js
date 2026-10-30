import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import { Select, Text } from 'components/form';
import MainLayout from 'layouts/MainLayout';
import { Form } from 'components/form';
import { Button } from 'components/Button';
import { getItems as getCounties } from 'store/counties/selectors';
import { getItems as getCities } from 'store/cities/selectors';
import { getPlace } from 'store/posf/selectors';
import { fetchAllItems as fetchCities } from 'store/cities/actions';
import { fetchAllItems as fetchCounties } from 'store/counties/actions';
import { searchPlace } from 'store/posf/actions';
import _ from 'lodash';
import MultiPlacesModal from 'components/modals/MultiPlacesModal';
import './SearchPlace.scss';
import Loader from 'components/Loader';

class SearchPlace extends Component {
    state = {
        cities: [],
        code: '',
        error: '',
        modalMessage: '',
        place: null,
        loading: false,
    };

    numbersOfPlacesModal = React.createRef();

    constructor(props) {
        super(props);
        autoBind(this);
    }

    async componentDidMount() {
        await this.props.fetchCounties();
    }

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
        await this.props.fetchCities(e.target.value);
    }

    async handleSumbit(e) {
        e.preventDefault();
        const { type, county, city, pod_clc } = this.formApi.getState().values;
        this.setState({ loading: true });
        await this.props.searchPlace(type, pod_clc);
        this.setState({ loading: false });
        if (Array.isArray(this.props.place?.Places)) {
            if (this.props.place?.Places.length > 1) {
                this.setState({
                    modalMessage: `Pentru codul introdus au fost identificate ${this.props.place?.Places.length} inregistrari. Pentru info suplimentare clarifica detaliile cu clientul!`,
                });
                this.numbersOfPlacesModal.current.show();
            }
        }
    }

    // upperCase = e => {
    //     e.preventDefault();
    //     this.formApi.setValue('pod_clc', e.target.value.toUpperCase());
    // };

    getCityOptions = (formApi, cities) => {
        if (formApi) {
            const county = formApi.getState().values['loc_judet'];
            if (county) {
                return _.filter(cities, city => city.judet === county).map(item => ({
                    value: item.internal_id,
                    label: item.denumire,
                }));
            }
        }
        return [];
    };

    getAddress = place => {
        if (place) {
            return (
                'Judet: ' +
                (place.address_county ? place.address_county : '') +
                ', ' +
                'Oras: ' +
                (place.address_city_name ? place.address_city_name : '') +
                ', ' +
                'Siruta: ' +
                (place.address_city_code ? place.address_city_code : '') +
                ', Tip strada: ' +
                (place.address_streetType ? place.address_streetType : '') +
                ', Strada: ' +
                (place.address_street ? place.address_street : '') +
                ', Numar strada: ' +
                (place.address_number ? place.address_number : '') +
                ', Cod postal: ' +
                (place.address_postcode ? place.address_postcode : '')
            );
        }
        return '';
    };

    getOperatorAddress = place => {
        if (place) {
            return place.address_number;
        }
        return '';
    };

    render() {
        let places;
        let modalMessage = '';
        if (!Array.isArray(this.props.place?.Places) && this.props.place?.Places != undefined) {
            places = [this.props.place?.Places];
        } else {
            if (Array.isArray(this.props.place?.Places)) {
                places = [this.props.place?.Places[0]];
            } else {
                places = this.props.place?.Places;
            }
        }

        return (
            <MainLayout>
                <MultiPlacesModal title={this.state.modalMessage} ref={this.numbersOfPlacesModal} />
                <div className="SearchPlace wrapper searchplace-page view-searchpalce-form">
                    <div className="search-form">
                        <Form getApi={this.setFormApi}>
                            {this.renderSearchError()}
                            <fieldset>
                                <h3>CAUTARE POSF</h3>
                                <div className="input-wrapper">
                                    {/* <div className="row">
                                        <Select
                                            className="col-md-6"
                                            label="Județ"
                                            name={'loc_judet'}
                                            options={getCountyOptions(counties)}
                                            onChange={e => this.handleCountyChange(e)}
                                            autocomplete
                                        />
                                        <Select
                                            className="col-md-6"
                                            label="Localitate"
                                            name={'loc_localitate'}
                                            options={cities}
                                            options={this.getCityOptions(this.formApi, cities)}
                                            // onChange={e => onCityChange(e, 'loc_', index)}
                                            autocomplete
                                        />
                                    </div> */}
                                    <div className="row">
                                        <Select
                                            className="col-md-6"
                                            label="POD/CLC"
                                            name="type"
                                            options={[
                                                { value: 'POD', label: 'POD' },
                                                { value: 'CLC', label: 'CLC' },
                                            ]}
                                            autoComplete="new-type"
                                        />
                                        <Text
                                            className="col-md-6"
                                            label="POD/CLC Code"
                                            name="pod_clc"
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
                    {places ? (
                        places.map(pl => (
                            <div className="row">
                                <div className="data">
                                    <div className="row">
                                        <div className="col-md-3 label">Adresa:</div>
                                        <div className="col-md-9">{this.getAddress(pl)}</div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3 label">Distribuitor:</div>
                                        <div className="col-md-9">{pl ? pl.name : ''}</div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3 label">POD/CLC:</div>
                                        <div className="col-md-9">
                                            {this.props.place
                                                ? pl.technicalDataElectricity_number
                                                : ''}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-12 label">
                                            Date Tehnice pentru Electricitate:
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3 label">Tip:</div>
                                        <div className="col-md-9">
                                            {pl.technicalDataElectricity_type}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3 label">Status conectare:</div>
                                        <div className="col-md-9">
                                            {pl.technicalDataElectricity_status}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3 label">Status POD/CLC:</div>
                                        <div className="col-md-6">
                                            {pl.technicalDataElectricity_counterType}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3 label">Index contor:</div>
                                        <div className="col-md-9">
                                            {pl.technicalDataElectricity_counterIndexDesc}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3 label">Tip document:</div>
                                        <div className="col-md-9">
                                            {pl.technicalDataElectricity_documentType}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3 label">Conexiune contor:</div>
                                        <div className="col-md-9">
                                            {pl.technicalDataElectricity_connectionType}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3 label">POD/CLC:</div>
                                        <div className="col-md-9">
                                            {pl.technicalDataElectricity_number}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3 label">Nivel tensiune:</div>
                                        <div className="col-md-9">
                                            {pl.technicalDataElectricity_voltageLevel}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3 label">Tip de retea:</div>
                                        <div className="col-md-9">
                                            {pl.technicalDataElectricity_networkType}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3 label">
                                            Putere de consum aprobat:
                                        </div>
                                        <div className="col-md-9">
                                            {pl.technicalDataElectricity_approvedConsumptionPower}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-12 label">
                                            Date Tehnice pentru Gaz:
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3 label">
                                            Data citire index contor:
                                        </div>
                                        <div className="col-md-9">
                                            {pl.technicalDataGas_counterIndexReadDate}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3 label">Valoare index contor:</div>
                                        <div className="col-md-6">
                                            {pl.technicalDataGas_counterIndexValue}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3 label">Serie contor:</div>
                                        <div className="col-md-9">
                                            {pl.technicalDataGas_counterSeries}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3 label">Tip contor:</div>
                                        <div className="col-md-9">
                                            {pl.technicalDataGas_counterType}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3 label">Tip document:</div>
                                        <div className="col-md-9">
                                            {pl.technicalDataGas_documentType}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3 label">Tip:</div>
                                        <div className="col-md-9">{pl.technicalDataGas_type}</div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3 label">POD/CLC:</div>
                                        <div className="col-md-6">{pl.technicalDataGas_number}</div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3 label">Contor inteligent:</div>
                                        <div className="col-md-9">
                                            {pl.technicalDataGas_smartMeter}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3 label">Status:</div>
                                        <div className="col-md-9">{pl.technicalDataGas_status}</div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3 label">Tip de retea:</div>
                                        <div className="col-md-9">
                                            {pl.technicalDataGas_networkType}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3 label">Presiune:</div>
                                        <div className="col-md-9">
                                            {pl.technicalDataGas_pressure}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <>{this.props.place?.message}</>
                    )}
                </div>
            </MainLayout>
        );
    }
}

const mapStateToProps = state => ({
    counties: getCounties(state),
    cities: getCities(state),
    place: getPlace(state),
});

const mapDispatchToProps = {
    fetchCities,
    fetchCounties,
    searchPlace,
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchPlace);
