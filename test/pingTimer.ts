import { afterEach, beforeEach, describe, it } from 'node:test'
import PingTimer from '../src/lib/PingTimer'
import { assert } from 'chai'
import { useFakeTimers, spy } from 'sinon'

describe('PingTimer', () => {
	let clock: sinon.SinonFakeTimers
	beforeEach(() => {
		clock = useFakeTimers()
	})

	afterEach(() => {
		clock.restore()
	})

	it('should schedule and destroy', () => {
		const keepalive = 10 // seconds
		const cb = spy()
		const pingTimer = new PingTimer(keepalive, cb, 'auto')

		assert.ok(pingTimer['timerId'], 'timer should be created automatically')

		clock.tick(keepalive * 1000 + 1)
		assert.equal(
			cb.callCount,
			1,
			'should trigger the callback after keepalive seconds',
		)
		clock.tick(keepalive * 1000 + 1)
		assert.equal(cb.callCount, 2, 'should reschedule automatically')
		pingTimer.destroy()
		assert.ok(
			!pingTimer['timerId'],
			'timer should not exists after destroy()',
		)

		assert.ok(
			pingTimer['destroyed'],
			'timer should have `destroyed` set to true after destroy()',
		)
	})

	it('should not re-schedule if timer has been cleared in check ping', () => {
		const keepalive = 10 // seconds
		const cb = spy()
		const pingTimer = new PingTimer(
			keepalive,
			() => {
				pingTimer.destroy()
				cb()
			},
			'auto',
		)

		clock.tick(keepalive * 1000 + 1)
		assert.equal(
			cb.callCount,
			1,
			'should trigger the callback after keepalive seconds',
		)
		clock.tick(keepalive * 1000 + 1)
		assert.equal(cb.callCount, 1, 'should not re-schedule')
		assert.ok(!pingTimer['timerId'], 'timer should not exists')
	})
})
