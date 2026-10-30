import React, { Fragment, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ConfirmOverlay from 'components/overlays/ConfirmOverlay';
import ModalOverlay from 'components/overlays/ModalOverlay';
import { updateRegistrationInfo } from 'store/registration/actions';
import { patch as patchSession } from 'store/session/actions';
import { toRegistrationPostData } from 'utils/serializers';
import { ABANDON_TYPES, ABANDON_LINK, STATIC_STEP_IDS } from 'utils/constants/app';
import { initEmbeddedChat } from './helpers';
import { getStepIdByPathname } from 'utils/helpers';

import './Footer.scss';

const propTypes = {
    showChat: PropTypes.bool.isRequired,
};

const Footer = ({ showChat, showButtons, location, hideLoading, showLoading }) => {
    const [showModalOverlay, setShowModalOverlay] = useState(false);
    const [problemDescription, setProblemDescription] = useState('');

    useEffect(() => {
        initEmbeddedChat();
    }, []);

    const registrationNumber = useSelector(state =>
        state.registration.registrationNumber
    );
    const session = useSelector(state => state.session);

    const dispatch = useDispatch();

    const toggleOverlay = () => {
        setProblemDescription('');
        setShowModalOverlay(!showModalOverlay);
    };

    const handleOverlayConfirm = async () => {

        dispatch(updateRegistrationInfo(
            toRegistrationPostData({ problemDescription, stepId: STATIC_STEP_IDS.PROBLEM_REPORT }, { session: session.data, location }),
            registrationNumber
        ));

        toggleOverlay();
    };

    const abortProcess = async (e) => {
        e.preventDefault();
        await showLoading();
        try {
            await dispatch(updateRegistrationInfo(
                toRegistrationPostData({
                    abortProcess: true,
                    stepId: getStepIdByPathname(window.location.pathname.replace('/', '')),
                }, { session: session.data, location }),
                registrationNumber
            ));
            await dispatch(patchSession({ abandon_type: ABANDON_TYPES.ABORT }));
            window.location = ABANDON_LINK;
            setTimeout(async () => {
                await hideLoading();
            }, 2000);


        } catch (error) {
            await hideLoading();
            console.error(error);
        }

    };

    return (
        <Fragment>
            <ModalOverlay
                show={showModalOverlay}
                onClose={toggleOverlay}
            >
                <ConfirmOverlay
                    title="Raportează o problemă"
                    description={
                        <div>
                            <span>Introduceţi detalii despre problema semnalată:</span>
                            <textarea
                                className="problemDescription"
                                name="problemDescription"
                                value={problemDescription}
                                onChange={e => setProblemDescription(e.target.value)}
                                rows={5}
                            />
                        </div>
                    }
                    confirmLabel="Raportează"
                    dismissLabel="CANCEL"
                    onConfirm={handleOverlayConfirm}
                    onDismiss={toggleOverlay}
                    show={showModalOverlay}
                    noLogo
                    noFixed
                    big
                />
            </ModalOverlay>
            <footer>
                <div style={{ width: '100%', background: 'white' }}>
                    <div className={classNames({ visible: showButtons }, 'buttonsContainer')}>
                        <a
                            href="#"
                            className="reportBtn"
                            onClick={toggleOverlay}
                        >
                            Raportează o problemă
                        </a>
                        <span className="delimiter" />
                        <a
                            href="#"
                            className="reportBtn"
                            onClick={abortProcess}
                        >
                            Abandonează procesul
                        </a>
                    </div>

                </div>

                <div className={'container'} style={{ backgroundColor: 'black', height: 100 }}>
                    <div className={'dropdown-divider'} style={{ marginTop: 40 }} />
                    <div className={'row'}>
                        <div className={'col-1'}>
                            <a href="#">
                                <img src="imgs/ppc_logo_white.png" style={{ width: 70, height: 40 }} />
                            </a>
                        </div>
                        <div className={'col-11'}>
                            <div className={'row'}>
                                <div className={'col-12'}>
                                    <span className={'copyright'}>© {new Date().getFullYear()} PPC Energy Services Co S.A. – Toate drepturile rezervate </span>
                                </div>
                            </div>
                            <div className={'row'}>
                                <div className={'col-9'}>
                                    <ul className={'footer-menu'}>
                                        <li><a href="https://www.ppcenergy.ro/cine-suntem/guvernanta-corporativa/legal">Legal</a></li>
                                        <li><a href="https://www.ppcenergy.ro/legislatie/protectia-datelor">Protecția datelor cu caracter personal</a></li>
                                        <li><a href="https://www.ppcenergy.ro/legislatie/politica-de-cookies">Politica de cookie</a></li>
                                        <li><a href="https://www.ppcenergy.ro/contact">Contacte utile</a></li>
                                        <li><a href="https://www.ppcenergy.ro/legislatie/conditii-de-utilizare-website">Condiții de utilizare</a></li>
                                        <li><a href="https://anpc.ro/">A.N.P.C.</a></li>
                                    </ul>
                                </div>
                                <div className={'col-3'}>
                                    <ul className={'footer-menu'}>
                                        <li><a href='https://www.facebook.com/ppcromaniaofficial'><img src={'social/fb.svg'} /></a></li>
                                        <li><a href='https://www.instagram.com/ppcromaniaofficial/'><img src={'social/insta.svg'} /></a></li>
                                        <li><a href='https://www.youtube.com/@PPCRomania'><img src={'social/youtube.svg'} /></a></li>
                                        <li><a href='https://www.linkedin.com/company/ppcromania'><img src={'social/linkedin.svg'} /></a></li>
                                        <li><a href='https://twitter.com/ppc_romania'><img src={'social/x.svg'} /></a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="embeddedChatContainer" className={classNames({ visible: false }, 'chatContainer')} />
            </footer>
        </Fragment>
    );
};

Footer.propTypes = propTypes;

export default Footer;
