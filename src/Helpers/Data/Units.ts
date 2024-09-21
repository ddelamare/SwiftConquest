import { HexType } from "../../Component/Hex/Hex";
import { GetUniqueId } from "../../Utils/Objects";


export function CreateUnitForPlayer(playerID : string | number){
    return {id: GetUniqueId(), owner: playerID + ""};
}

export function GetHexesWithDudes(G) {
    return G.map.filter((hex : HexType) => hex.units.length > 0);
}