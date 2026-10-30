import React, { useState, Fragment } from 'react';
import { Select } from '../../components/form';
import Button from '../../components/Button';

const SupplyContractSelection = props => {
    const [hasActiveContract, setActiveContract] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [changeSupplyContact, setChangeSupplyContact] = useState(false);
    const suppliers = ['a', 'b', 'c'];

    return (
        <Fragment>
            <div className="group-name">Ai un contract de furnizare active ?</div>
            <div className="row">
                <Button value={'Da'} onClick={setActiveContract(true)} />
                <Button value={'Nu'} onClick={setActiveContract(false)} />
            </div>
            <div className="group-name">Care este furnizorul tau actual ?</div>
            <div className="row">
                <Select
                    className="col-md-6"
                    label="Suppliers"
                    name="rol_client"
                    options={suppliers}
                    onChange={e => setSelectedSupplier(e.target.value)}
                />
            </div>
            <div className="group-name">Vrei sa schimbi titularul contactului de furnizare ?</div>
            <div className="row">
                <Button value={'Da'} onClick={setChangeSupplyContact(true)} />
                <Button value={'Nu'} onClick={setChangeSupplyContact(false)} />
            </div>
        </Fragment>
    );
};

export default SupplyContractSelection;
