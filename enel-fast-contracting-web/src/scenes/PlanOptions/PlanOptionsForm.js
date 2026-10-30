import React, { Component } from 'react';
import _ from 'lodash';

import Form from 'components/validation/form';
import Button from 'components/validation/button';
import Select from 'components/validation/select';
import { required } from 'components/validation/rules';

import './PlanOptions.scss';

class PlanOptionsForm extends Component {
    render() {
        const {
            hasOfferParams,
            setForm,
            loaded,
            counties,
            form,
            handleInputChange,
            handleNextClick,
            handleRestoreProcess,
        } = this.props;

        return (
            <Form className="hero-form" ref={(c) => { setForm(c); }}>
                {loaded && <div className="row ai-c">
                    <div className="col-md-7">
                        <div className="row first-page-autocomplete">
                            <Select
                                name="judet"
                                label="În ce județ se află locul de consum?"
                                placeholder="Alege"
                                value={form.judet}
                                className="form-control"
                                containerClass="mb-3 col-md-12"
                                validations={[required]}
                                autocomplete
                                onSelect={handleInputChange}
                                items={counties}
                            />
                        </div>
                        {/*! hasOfferParams && <div className="row offset-top-lg">
                                        <BinaryRadio
                                            containerClass="mb-3 col-md-12"
                                            name="formInput61"
                                            label="Pe ce perioadă vrei să închei contractul de furnizare?"
                                            onAgree={e => this.handleRadioChange(e, 'furn24', '0')}
                                            onDisagree={e => this.handleRadioChange(e, 'furn24', '1')}
                                            value={this.state.form.furn24}
                                            values={['0', '1']}
                                            valueLabels={['12 luni', '24 luni']}
                                            validations={[required]}
                                        />
                                    </div> */}
                        <div className="row">
                            <div className="mb-3 col-md-12" >
                                <div className="text-left offset-top">
                                    <Button type="submit" className="btn btn-primary btn-full-mobile col-12" onClick={handleNextClick}>
                                        Continuă
                                    </Button>
                                    {!hasOfferParams && <Button type="submit" className="btn btn-underline-primary btn-full-mobile col-12 underline--white" onClick={handleRestoreProcess}>
                                        Reia Procesul
                                    </Button>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 offset-md-1">
                        <img className="home-illustration" src="home.png" />
                    </div>
                </div>}
            </Form>
        );
    }
}

export default PlanOptionsForm;
