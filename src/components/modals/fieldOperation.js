import React from 'react';
import Modal from "react-responsive-modal";
import {curPlayerInStage} from "../../auto/util";
import Button from "@material-ui/core/Button";

export default function FieldOperationModal(props) {
        return<Modal open={curPlayerInStage(this.props.ctx,'fieldOrCity') && this.props.isActive} onClose={()=>{}}>
            请选择是否接野：
            <Button onClick={()=>{this.props.moves.recruitOrMarch('field')}}>
                是
            </Button>
            <Button onClick={()=>{this.props.moves.recruitOrMarch('city')}}>
                否
            </Button>
        </Modal>

}
