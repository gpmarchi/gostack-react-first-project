import React from 'react';
import PropTypes from 'prop-types';

// import { Container } from './styles';

export default function Repository({ match }) {
  const { repository } = match.params;
  return <h1>Repository: {decodeURIComponent(repository)}</h1>;
}

Repository.defaultProps = {
  match: { params: {} },
};

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string.isRequired,
    }),
  }),
};
