import * as React from 'react'
import { ReactComponent as UnitIcon } from '../../assets/unit.svg'

interface Props {
    owner: string | null
}
 
interface State {
    
}
 
class Unit extends React.Component<Props, State> {
    render() { 
        const BaseTag = false? 'svg' : 'g'


    return (
        <BaseTag style={{transform: "scale(10%)"}} height="32" width="32" viewBox="-50 -50 100 100">
            <UnitIcon  />
        </BaseTag> 
    )
    }
}
 
export default Unit;