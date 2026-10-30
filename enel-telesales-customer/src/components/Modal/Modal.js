import React from 'react';
import { Box, Modal, useMediaQuery, useTheme } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';

const ModalComponent = ({ className, showModal, toggleModal, ...props }) => {
    const modal = React.createRef();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Modal
            open={showModal}
            className={`PlanDetailsOverlay ${className ? className : ''}`}
            ref={modal}
            onClose={toggleModal}
            slots={{ backdrop: Backdrop }}
            slotProps={{
                backdrop: {
                    timeout: 500,
                },
            }}
        >
            <Box
                sx={{
                    width: isSmallScreen ? '85%' : '47.5%',
                    bgcolor: '#ffffff',
                    boxShadow: '14px',
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    height: '80%',
                }}
            >
                {props.children}
            </Box>
        </Modal>
    );
};

export default ModalComponent;
