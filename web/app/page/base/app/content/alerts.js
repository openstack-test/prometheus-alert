import React, { Component } from 'react'
import { Form, Table, Pagination, Input, Button, DatePicker, Tag, Select } from 'antd'
import { getAlerts } from '@apis/alerts'
import { tableTimeWidth } from '@configs/const'
import { removeObjectUseless } from '@configs/common'
import { Link } from 'react-router-dom'
import moment from 'moment'

const { Option } = Select

@Form.create({})
export default class Strategy extends Component {
  state = {
    dataSource: [],
    page: {
      current: 1,
      total: 0,
      size: 10,
    },
    labalWidth: 100,
  }
  componentDidMount() {
    this.getList()
  }
  getList(config = {}) {
    const { page } = this.state
    getAlerts({}, (res) => {
      const { total, alerts } = res
      const labalWidth = Math.max(((this.calcLabelWidth(alerts) + 1) * 6.2) + 16, 80)
      this.setState({
        dataSource: alerts.sort((a, b) => b.id - a.id),
        page: { ...page, total },
        labalWidth,
      })
    }, { params: { page: page.current, pagesize: page.size, ...config } })
  }
  calcLabelWidth(data) {
    let maxLength = 0
    data.forEach((item) => {
      const { labels } = item
      Object.keys(labels || {}).forEach((key) => {
        maxLength = Math.max(maxLength, key.length + labels[key].length)
      })
    })
    return maxLength
  }
  pageChange = (page, pageSize) => {
    this.setState({
      page: {
        ...this.state.page,
        current: page,
      },
    }, () => {
      this.handleSearch()
    })
  }
  formatSearch(values) {
    const { ...value } = values
    Object.keys(value).forEach((key) => {
      switch (key) {
        case 'timestart':
        case 'timeend':
          if (value[key]) {
            value[key] = moment(value[key]).format('YYYY-MM-DD HH:mm:ss')
            break
          }
          removeObjectUseless(value, key)
          break
        case 'summary':
          removeObjectUseless(value, key)
          break
        case 'status':
          if (value[key] === -1) {
            delete value[key]
          }
          break
        default: break
      }
    })
    return value
  }
  handleSearch = (e) => {
    e && e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.getList(this.formatSearch(values))
      }
    });
  }
  render() {
    const { dataSource, page, labalWidth } = this.state
    const { getFieldDecorator } = this.props.form
    const columns = [
      { title: 'id', align: 'center', dataIndex: 'id', sorter: (a, b) => a.id - b.id },
      {
        title: 'Rule ID',
        align: 'center',
        dataIndex: 'rule_id',
        render: ruleId => (<Link to={`/rules?id=${ruleId}`}>{ruleId}</Link>),
      },
      { title: '?????????', align: 'center', dataIndex: 'value' },
      {
        title: '????????????',
        align: 'center',
        dataIndex: 'status',
        render: status => (
          <span>{status === 2 ? '??????' : status === 0 ? '??????' : '?????????'}</span>
        ),
      },
      {
        title: '???????????????',
        align: 'center',
        dataIndex: 'count',
        render: count => (
          <span>{count+1}</span>
        ),
      },
      { title: '??????', align: 'center', dataIndex: 'summary', width: 100 },
      {
        title: 'label',
        align: 'center',
        dataIndex: 'labels',
        width: labalWidth,
        render: (labels) => {
          if (labels && Object.prototype.toString.call(labels) === '[object Object]') {
            return Object.keys(labels).map(key => <Tag color="cyan" style={{ marginTop: '5px' }}>{key}: {labels[key]}</Tag>)
          }
          return '-'
        },
      },
      { title: '??????', align: 'center', dataIndex: 'description' },
      { title: '?????????', align: 'center', dataIndex: 'confirmed_by' },
      {
        title: '????????????',
        align: 'center',
        dataIndex: 'fired_at',
        width: tableTimeWidth,
        render: firedAt => (
          <span>{firedAt === '0001-01-01T00:00:00Z' ? '--' : moment(firedAt).format('YYYY.MM.DD HH:mm:ss')}</span>
        ),
      },
      {
        title: '????????????',
        align: 'center',
        dataIndex: 'confirmed_at',
        width: tableTimeWidth,
        render: confirmedAt => (
          <span>{confirmedAt === '0001-01-01T00:00:00Z' ? '--' : moment(confirmedAt).format('YYYY.MM.DD HH:mm:ss')}</span>
        ),
      },
      {
        title: '??????????????????',
        align: 'center',
        dataIndex: 'confirmed_before',
        width: tableTimeWidth,
        render: confirmedBefore => (
          <span>{confirmedBefore === '0001-01-01T00:00:00Z' ? '--' : moment(confirmedBefore).format('YYYY.MM.DD HH:mm:ss')}</span>
        ),
      },
      {
        title: '????????????',
        align: 'center',
        dataIndex: 'resolved_at',
        width: tableTimeWidth,
        render: resolvedAt => (
          <span>{resolvedAt === '0001-01-01T00:00:00Z' ? '--' : moment(resolvedAt).format('YYYY.MM.DD HH:mm:ss')}</span>
        ),
      },
    ]
    return (
      <div>
        <Form layout="inline" onSubmit={this.handleSearch}>
          <Form.Item label="??????">
            {getFieldDecorator('summary', {})(<Input placeholder="???????????????" />)}
          </Form.Item>
          <Form.Item label="??????">
            {getFieldDecorator('status', {
              initialValue: -1,
            })(<Select>
              <Option value={-1}>??????</Option>
              <Option value={0}>??????</Option>
              <Option value={1}>?????????</Option>
              <Option value={2}>??????</Option>
            </Select>)}
          </Form.Item>
          <Form.Item label="????????????" style={{ marginBottom: 0 }}>
            <Form.Item style={{ marginRight: 0 }}>
              {getFieldDecorator('timestart', {})(<DatePicker
                format="YYYY-MM-DD HH:mm:ss"
                showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                placeholder="??????????????????"
              />)}
            </Form.Item>
            <span style={{ width: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>~</span>
            <Form.Item style={{ marginBottom: 0 }}>
              {getFieldDecorator('timeend', {})(<DatePicker
                format="YYYY-MM-DD HH:mm:ss"
                showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                placeholder="??????????????????"
              />)}
            </Form.Item>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">??????</Button>
          </Form.Item>
        </Form>
        <Table dataSource={dataSource} columns={columns} pagination={false} scroll={{ x: 1300 }} rowKey="id" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '15px' }}>
          <Pagination onChange={this.pageChange} current={page.current} pageSize={page.size} total={page.total} />
        </div>
      </div>
    )
  }
}
