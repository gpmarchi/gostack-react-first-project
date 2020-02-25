import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList, IssueFilter, Pagination } from './styles';

export default class Repository extends Component {
  state = {
    repository: {},
    issues: [],
    loading: true,
    statuses: ['all', 'open', 'closed'],
    filter: 'open',
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;

    const { filter, page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: filter,
          per_page: 5,
          page,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  async componentDidUpdate(_, prevState) {
    const { filter, repository, page } = this.state;

    if (filter !== prevState.filter || page !== prevState.page) {
      const issues = await api.get(`/repos/${repository.full_name}/issues`, {
        params: {
          state: filter,
          per_page: 5,
          page,
        },
      });

      this.setState({ issues: issues.data });
    }
  }

  handleFilterChange = event => {
    this.setState({ filter: event.target.id, page: 1 });
  };

  handlePageChange = action => {
    const { page } = this.state;

    this.setState({ page: action === 'next' ? page + 1 : page - 1 });
  };

  render() {
    const { repository, issues, loading, statuses, filter, page } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <IssueFilter selected={filter}>
          {statuses.map(status => (
            <button
              key={status}
              type="button"
              id={status}
              onClick={this.handleFilterChange}
            >
              {status}
            </button>
          ))}
        </IssueFilter>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <Pagination>
          <button
            type="button"
            disabled={page < 2}
            onClick={() => this.handlePageChange('previous')}
          >
            <FaChevronLeft color="#FFF" size={14} />
          </button>
          <span>{page}</span>
          <button type="button" onClick={() => this.handlePageChange('next')}>
            <FaChevronRight color="#FFF" size={14} />
          </button>
        </Pagination>
      </Container>
    );
  }
}

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};
