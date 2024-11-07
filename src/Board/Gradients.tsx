function Gradients() {
    return <defs>
        <radialGradient id="RadialGradient1">
            <stop offset="0%" stop-color="red" />
            <stop offset="100%" stop-color="blue" />
        </radialGradient>
        <radialGradient id="AvailableHexGradient">
            <stop offset="34%" stop-color="#cfcd05" />
            <stop offset="94%" stop-color="#1fc617" />
            <stop offset="100%" stop-color="#b82109" />
        </radialGradient>
        <filter id="SelectGlow" x="-500%" y="-500%" width="7000%" height="7000%">
          <feFlood result="flood" flood-color="#FFD700" flood-opacity="12"></feFlood>
          <feComposite in="flood" result="mask" in2="SourceGraphic" operator="in"></feComposite>
          <feMorphology in="mask" result="dilated" operator="dilate" radius="1"></feMorphology>
          <feGaussianBlur in="dilated" result="blurred" stdDeviation="0.5"></feGaussianBlur>
          <feMerge>
              <feMergeNode in="blurred"></feMergeNode>
              <feMergeNode in="SourceGraphic"></feMergeNode>
          </feMerge>
      </filter>
    </defs>;
}

export default Gradients;