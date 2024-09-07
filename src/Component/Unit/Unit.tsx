import * as React from 'react'
import  UnitIcon from '../../assets/unit.svg'

interface Props {
    owner: string | null
}
 
interface State {
    
}
 
class Unit extends React.Component<Props, State> {
    render() { 
        return ( <UnitIcon></UnitIcon> );
    }
}
 
export default Unit;