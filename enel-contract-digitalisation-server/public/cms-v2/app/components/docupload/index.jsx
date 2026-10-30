import React, { Fragment } from 'react';
import { connect } from 'react-redux';


import buildFiltersFromState from '../../helpers/buildFiltersFromState.js';
import api from "../../api/offer";
class Sessions extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            index: 0,
            citys: [],
            offers:[],
            offerTypes: [
                {
                    value: '',
                    label: 'Toate',
                },
                {
                    value: 'EE',
                    label: 'Electricitate',
                },
                {
                    value: 'GAZ',
                    label: 'Gaz',
                },
                {
                    value: 'COMBO',
                    label: 'Combo',
                },
            ],
            offerDuration: [
                { label: '12 luni', value: 0 },
                { label: '24 luni', value: 1 },
            ],
            loading: true,
            city: null,
            type: null,
            duration: null,
            selectedFile: []
        };
        this.swiper = null;

        this.tab_onclick = this.tab_onclick.bind(this);
    }

    async componentDidMount(){
        console.log(this.props)
        const {data} = await api.city();
        this.setState((state)=>({...state,citys: data,loading:false}))
    }

    tab_onclick(index) {
        return () => {
            if (!this.swiper)
                return;

            this.setState({
                index: index
            });
            this.swiper.slideTo(index);
        };
    }

    handleSelectCity = async (e) =>{
        const city = e.target.value;
        this.setState((state)=>({...state,city}))
    }


   

    handleOfferType = async (e) =>{
        const type = e.target.value;
        this.setState((state)=>({...state,type}))
    }
    handleOfferDuration = async (e) =>{
        const duration = e.target.value;
        this.setState((state)=>({...state,duration}),async () =>{
            const {city,duration,type} = this.state
            const {variantePreturi} = await api.getOffers({city, duration, type});
            const offers = variantePreturi;
           
            this.setState((state)=>({...state,offers}))
        })
    }

    handleSelectOffer = async (e) =>{
        const offer = e.target.value;
        this.setState((state)=>({...state,offer}))
    }


    onChangeHandler= (event)=>{
        const files = event.target.files;
        const array = []
        for (const [key, value] of Object.entries(files)) {
            array.push(value)
        }
        this.setState({
            selectedFile: array,
            loaded: 0,
        })
    }
    saveDocuments = async (e) => {
        e.preventDefault();
        const formData = new FormData() 
        if(!this.state.offer){
            alert('Trebuie să selectați o ofertă!')
            return;
        }
        if(this.state.selectedFile.length === 0){
            alert('Please select file first!')
            return;
        }
        
        this.state.selectedFile.forEach(file => {
            formData.append('doc', file);
        })
        formData.append('offer_id', this.state.offer)
        const response = await api.postDocuments(formData);
        const { status} = response;
      
        if(status === 201){
            alert("Salvat cu succes!")
            return
        }else{
            alert("Nu s-a putut salva documentul!")
            return
        }
    }
    render() {
        return this.props.isAuditor && <div>
            <div className="content" style={{width: "100%"}} key={0}>
                <div className="content-box" >
                    <div className="content-box-header">
                        <h3>Scțiunea Încărcați Documente</h3>
                    </div>
                    <div className="content-box-body" style={{padding:"4rem 4rem"}}>
                        <form onSubmit={this.saveDocuments}>
                        <select onChange={this.handleSelectCity} required>
                            <option key="0">Selectați un Județ</option>
                            {this.state.citys.map(item => {
                                return <option key={item.id} value={item.denumire}>{item.denumire}</option>
                            })}
                        </select>
                        <br/>
                        <br/>
                        <select onChange={this.handleOfferType}>
                            <option key="0">Tip</option>
                            {this.state.offerTypes.map(item => {
                                return <option key={item.value} value={item.value}>{item.label}</option>
                            })}
                        </select>
                        <br/>
                        <br/>
                        <select onChange={this.handleOfferDuration}>
                            <option key="0">Durată</option>
                            {this.state.offerDuration.map(item => {
                                return <option key={item.value} value={item.value}>{item.label}</option>
                            })}
                        </select>
                        <br/>
                        <br/>
                        <select onChange={this.handleSelectOffer}>
                            <option key="0">Oferte</option>
                            {this.state.offers.length > 0 && this.state.offers.map(item => {
                                return <option key={item.id} value={item.cod}>{item.denumire}</option>
                            })}
                        </select>
                        <br/>
                        <br/>
                        
                        <input 
                            type="file"
                            name="file" 
                            id="fileInput"
                            onChange={this.onChangeHandler}
                        />
                        <button className="button black">Încărcați Documente</button>
                        </form>
                        <div className="tabs">
                            
                        </div>
                    </div>
                </div>
            </div>
            </div>
        
    }
}

export default connect(state => {
    return {
        router: state.router,
        user: state.user,
        isAdmin: state.user.isAdmin,
        isFsdAdmin: state.user.isFsdAdmin,
        isAuditor: state.user.isAuditor,
    };
}, dispatch => {
    return {
        
    }
})(Sessions);
