import { Table, Tag, Tooltip } from 'antd';
import { Link, useHistory } from 'react-router-dom';
import './orderTable.css';



function OrderTable({ data, loading, belongsTo}) {
    const history = useHistory();

    const columns = [
        {
            title: 'TRACK NUMBER',
            dataIndex: 'track_number',
            key: 'track_number',
            width: 120,
            render: text => <Link to={`/${belongsTo === 'user' ? 'user': 'company'}/track/order/${text}`}>{text}</Link>,
        },
        {
            title: 'ORDER PACKAGE',
            dataIndex: 'order_package',
            key: 'order_package',
            width: 250,
            ellipsis: {
                showTitle: false,
              },
              render: package_content => (
                <Tooltip placement="topLeft" title={package_content}>
                  {package_content}
                </Tooltip>
              ),
        },
        {
            title: 'DELIVERY COST',
            dataIndex: 'delivery_cost',
            key: 'delivery_cost',
            render: cost => {
    
                return (
                    <span>
                       
                     {cost ? cost : 'Not specified'}
                    </span>
                );
            }
        }, {
            title: 'PAYMENT STATUS',
            dataIndex: 'payment_status',
            key: 'payment_status',
            width: 200,
            ellipsis: {
                showTitle: false,
              },
            render: status => {
                let color = status === 'Paid' ? {backgroundColor: '#36ff3178'} : {backgroundColor: '#f77f002b', color: '#ff8300 !important'};
    
                return (
                    <Tag className="payment_status_tag" style={color}>
                        {status === 'Paid' ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.0286 9.18785C13.2389 8.49412 13.347 7.77163 13.347 7.03314C13.347 3.15532 10.3823 0 6.73868 0C3.0951 0 0.130371 3.15532 0.130371 7.03314C0.130371 10.911 3.0951 14.0663 6.73868 14.0663C7.43556 14.0663 8.11441 13.9544 8.76323 13.7306C9.24083 15.0477 10.4423 15.9844 11.8451 15.9844C13.6684 15.9844 15.1493 14.4084 15.1493 12.4678C15.1493 10.9717 14.2662 9.69615 13.0286 9.18785ZM6.73868 6.39377C7.73263 6.39377 8.54095 7.25405 8.54095 8.3119C8.54095 9.14501 8.03812 9.85376 7.33944 10.1181V10.23C7.33944 10.583 7.0703 10.8694 6.73868 10.8694C6.40707 10.8694 6.13793 10.583 6.13793 10.23H5.53717C5.20555 10.23 4.93642 9.94359 4.93642 9.59065C4.93642 9.23772 5.20555 8.95128 5.53717 8.95128H6.73868C7.07 8.95128 7.33944 8.66451 7.33944 8.3119C7.33944 7.95928 7.07 7.67252 6.73868 7.67252C5.74473 7.67252 4.93642 6.81224 4.93642 5.75439C4.93642 4.92128 5.43895 4.21221 6.13793 3.94815V3.83626C6.13793 3.48333 6.40707 3.19688 6.73868 3.19688C7.0703 3.19688 7.33944 3.48333 7.33944 3.83626H7.9402C8.27181 3.83626 8.54095 4.1227 8.54095 4.47564C8.54095 4.82857 8.27181 5.11501 7.9402 5.11501H6.73868C6.40737 5.11501 6.13793 5.40177 6.13793 5.75439C6.13793 6.10701 6.40737 6.39377 6.73868 6.39377ZM11.8451 14.7057C10.6856 14.7057 9.74246 13.7018 9.74246 12.4678C9.74246 11.2339 10.6856 10.23 11.8451 10.23C13.0046 10.23 13.9478 11.2339 13.9478 12.4678C13.9478 13.7018 13.0046 14.7057 11.8451 14.7057Z" fill="#11B603" />
                        </svg> : <svg width="11" height="16" viewBox="0 0 11 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 0.726797H0.834942V2.09318C0.834942 4.28084 1.82574 6.24319 3.3676 7.10808L4.30273 7.63137L3.3676 8.15467C1.82574 9.01955 0.834942 10.9819 0.834942 13.1696V14.5359H0V15.2627H10.0193V14.5359H9.18436V13.1696C9.18436 10.9819 8.19356 9.01955 6.6517 8.15467L5.71657 7.63137L6.6517 7.10808C8.19356 6.24319 9.18436 4.28084 9.18436 2.09318V0.726797H10.0193V0H0V0.726797ZM6.43462 8.82332C7.07474 9.18672 7.60354 9.76089 7.98204 10.4804C7.5924 10.8874 6.58491 11.8105 5.28796 11.7741V11.2654H4.73134V11.6942C4.66454 11.6796 4.59218 11.6578 4.51982 11.636C3.10042 11.1781 2.10405 11.5488 1.51959 11.934C1.80347 10.5604 2.55492 9.40476 3.58468 8.82332L4.73134 8.17647V9.81176H5.28796V8.17647L6.43462 8.82332ZM8.62773 2.09318C8.62773 2.37663 8.61103 2.65281 8.5665 2.92173C7.62023 3.01621 6.98568 3.48136 6.41792 3.88837C5.76666 4.36805 5.2991 4.70965 4.54208 4.38259C3.23957 3.80842 2.24878 4.07733 1.80347 4.2663C1.53629 3.61218 1.39157 2.86358 1.39157 2.09318V0.726797H8.62773V2.09318Z" fill="#F77F00" />
                            </svg>
                        }
                         <Tooltip placement="topLeft" title={status}>
                        {status}
                      </Tooltip>
                    </Tag>
                );
            }
        },
    
        {
            title: 'ORDER STATUS',
            key: 'order_status',
            dataIndex: 'order_status',
            render: (status) => {
                // let color = status === 'Delivered' ? '#05f70070' : '#f759006e';
    
                return (
                    <Tag  style={{
                        backgroundColor: status === 'Cancelled' ? '#e02a2a' : status === 'Approved' ? '#096dd9' : status === 'In Transit' ? 'green' : '#f75900fa' ,
                        justifyContent: 'center'
                    }} className="delivery_status_badge">
                        {status === 'Delivered' && <svg style={{color: 'white'}} width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M0.657689 9.78134C-0.307818 8.71818 1.0134 8.25305 1.6232 8.45239C2.43625 8.65173 3.1985 9.11687 3.85911 9.7149C4.72298 10.5123 5.63767 9.18331 6.14583 8.38594C7.87358 5.66158 9.85541 3.20302 12.0405 1.01024C13.4634 -0.318715 14.3272 1.01024 13.0568 2.40564C10.2111 5.52869 7.72113 9.11687 5.7393 13.1702C5.43441 13.7018 5.07869 14.2998 4.62135 14.1004C4.31645 13.9676 1.11503 10.3129 0.657689 9.78134Z" fill="#11B603" />
                        </svg>
                        }
                        <span style={{color: 'white'}}>{status}</span>
                    </Tag>
                );
            }
        },
    ];

    return (
        <Table className="order_table" onRow={(record, rowIndex) => {
            return {
              onClick: event => {
               history.push(`/${belongsTo === 'user' ? 'user': 'company'}/track/order/${record.track_number}`)
              }, // click row
            };
          }} columns={columns} loading={loading} scroll={{ x: 900 }} sticky  dataSource={data} />
    )
}

export default OrderTable
