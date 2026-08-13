import * as React from 'react'
import { ReactComponent as UnitIcon } from '../../assets/unit.svg'
import type { UnitState } from '../../Domain/Model';

interface UnitProps {
    owner: string | null
}

export type UnitType = UnitState;

class Unit extends React.Component<UnitProps> {
    render() {
        const BaseTag = false ? 'svg' : 'g'


        return (
            <BaseTag style={{ transform: "scale(10%)", stroke: "var(--outline-color)", strokeWidth: 15 }} fill={`var(--player-${this.props.owner}-color)`} height="32" width="32" viewBox="-50 -50 100 100">
                <UnitIcon />
            </BaseTag>
        )
    }
}

export default Unit;
