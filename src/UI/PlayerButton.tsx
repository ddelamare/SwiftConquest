import { FunctionComponent } from "react";
import './PlayerButton.css'
interface PlayerButtonProps {
    onClick: React.MouseEventHandler<HTMLDivElement>,
    children: string | JSX.Element | JSX.Element[] | null,
}

const PlayerButton: FunctionComponent<PlayerButtonProps> = (props: PlayerButtonProps) => {
    return (
        <div className="player-button flex-center" onClick={props.onClick}>
            {props.children}
        </div>
    );
}

export default PlayerButton;