module mint_nft_sui::nft {
    use sui::object::{UID, new};
    use sui::tx_context::{TxContext, sender};
    use sui::transfer;
    use std::string::String;

    /// Definição do NFT
    public struct MyNFT has key, store {
        id: UID,
        name: String,
        description: String,
        url: String,
    }

    /// Função para mintar um NFT
    public entry fun mint(
        name: String,
        description: String,
        url: String,
        ctx: &mut TxContext
    ) {
        let nft = MyNFT {
            id: new(ctx),
            name,
            description,
            url,
        };
        transfer::transfer(nft, sender(ctx));
    }
}
