import React from 'react';

import {useStores} from 'stores';

interface Props {
  id?: string,
}

const GaplessPlayer = ({
  id = 'player'
}: Props): React.ReactElement => {
  const {musicStore} = useStores();
  const playerRef = React.useRef(null);

  React.useEffect(() => {
    const current = playerRef.current;
    if(current !== null && musicStore.api === null) {
      musicStore.initializePlayer(current);
    }
  });

  return (
    <div ref={playerRef} id={id} style={{display:"none"}} />
  );
};

export default GaplessPlayer;
