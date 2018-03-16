import React from 'react';
import Card from 'semantic-ui-react/dist/es/views/Card/Card';
import Pagination from 'semantic-ui-react/dist/es/addons/Pagination/Pagination';

export default class PaginatedCardGroup extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      activePage: 1
    };
  }

  onPageChange = (event, props) => {
    const { activePage } = props;
    this.setState({ activePage });
  }

  render() {
    const { activePage } = this.state;
    const { items, itemsPerPage, className } = this.props;

    const totalPages = Math.ceil(items.length / itemsPerPage);
    const pageStart = (activePage - 1) * itemsPerPage;
    const pageEnd = pageStart + itemsPerPage;
    const itemsOnPage = items.slice(pageStart, pageEnd);

    return (
      <div className={className}>
        <div className="group">
          <Card.Group items={itemsOnPage} />
        </div>
        <div className="pagination">
          <Pagination
            prevItem={null}
            nextItem={null}
            firstItem={null}
            lastItem={null}
            defaultActivePage={1}
            onPageChange={this.onPageChange}
            totalPages={totalPages}
          />
        </div>
      </div>
    );
  }
}
