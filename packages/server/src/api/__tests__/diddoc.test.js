const DidDocumentHandler = require('../diddoc')

describe('DidDocumentHandler', () => {
  let sut
  let claimMgrMock = { getPublicKeyHex: jest.fn(), getIssuerDomain: jest.fn() }

  beforeAll(() => {
    sut = new DidDocumentHandler(claimMgrMock)
  })

  test('empty constructor', () => {
    expect(sut).not.toBeUndefined()
  })

  test('happy path', done => {
    claimMgrMock.getPublicKeyHex.mockReturnValue('0x1')
    claimMgrMock.getIssuerDomain.mockReturnValue('example.com')

    sut.handle(
      {
        headers: { origin: 'https://subdomain.3box.io' }
      },
      {},
      (err, res) => {
        expect(err).toBeNull()
        expect(res.id).toEqual('did:web:example.com')
        expect(res.publicKey[0].publicKeyHex).toEqual('0x1')
        expect(res.publicKey[0].id).toEqual('did:web:example.com#owner')
        expect(res.publicKey[0].owner).toEqual('did:web:example.com')
        expect(res.authentication[0].publicKey).toEqual(
          'did:web:example.com#owner'
        )
        done()
      }
    )
  })
})
