
export default function Patterns() {
    return <defs>
        <pattern id="attackToken" height="100%" width="100%"
            patternContentUnits="objectBoundingBox"
            viewBox="0 0 1 1" preserveAspectRatio="xMidYMid slice">
            <image height="1" width="1" preserveAspectRatio="xMidYMid slice" href={require('../assets/wide-arrow-dunk.svg').default}  />
        </pattern>
        <pattern id="defendToken" height="100%" width="100%"
            patternContentUnits="objectBoundingBox"
            viewBox="0 0 1 1" preserveAspectRatio="xMidYMid slice">
            <image height="1" width="1" preserveAspectRatio="xMidYMid slice" href={require('../assets/checked-shield.svg').default}  />
            </pattern>
        <pattern id="gatherToken" height="100%" width="100%"
            patternContentUnits="objectBoundingBox"
            viewBox="0 0 1 1" preserveAspectRatio="xMidYMid slice">
            <image height="1" width="1" preserveAspectRatio="xMidYMid slice" href={require('../assets/war-pick.svg').default}  />
            </pattern>
        <pattern id="aidToken" height="90%" width="90%"
            patternContentUnits="objectBoundingBox"
            viewBox="0 0 1 1" preserveAspectRatio="xMidYMid slice">
            <image height="1" width="1" preserveAspectRatio="xMidYMid slice" href={require('../assets/first-aid-kit.svg').default}  />
            </pattern>
        <pattern id="unknownToken" height="100%" width="100%"
            patternContentUnits="objectBoundingBox"
            viewBox="0 0 1 1" preserveAspectRatio="xMidYMid slice">
            <image height="1" width="1" preserveAspectRatio="xMidYMid slice" href={require('../assets/wide-arrow-dunk.svg').default}  />
            </pattern>
    </defs>
}