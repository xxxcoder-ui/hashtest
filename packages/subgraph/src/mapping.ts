import { BigInt } from "@graphprotocol/graph-ts"
import {
  HashAvatars as TokenContract,
  ApprovalForAll,
  SecondarySaleFees,
  TransferBatch,
  TransferSingle,
  URI
} from "../generated/HashAvatars/HashAvatars"

import {
  Stories as StoriesContract,
  UriAdded,
} from "../generated/Stories/Stories"

import {
  Token,User,Story
} from '../generated/schema'


import { ipfs, json, JSONValue,Bytes } from '@graphprotocol/graph-ts'


export function handleApprovalForAll(event: ApprovalForAll): void {

}

export function handleSecondarySaleFees(event: SecondarySaleFees): void {}

export function handleTransferBatch(event: TransferBatch): void {}

export function handleTransferSingle(event: TransferSingle): void {
  let token = Token.load(event.params._id.toString());
  if (!token) {
    token = new Token(event.params._id.toString());
    token.creator = event.params._to.toHexString();
    token.tokenID = event.params._id;
    token.supply = event.params._value;
    token.createdAtTimestamp = event.block.timestamp;
    token.owner = event.params._to.toHexString();
    let tokenContract = TokenContract.bind(event.address);
    token.metadataURI = tokenContract.uri(event.params._id);
    let hash = token.metadataURI.split('ipfs://').join('')
    let data = ipfs.cat(hash) as Bytes;
    let value = json.fromBytes(data).toObject()

    let name = value.get('name');
    if(name){
      token.name = name.toString();
    }
    let imageUri = value.get('image');
    if(imageUri){
      token.imageURI = imageUri.toString();
    }
  } else {
    token.owner = event.params._to.toHexString();

  }


  token.save();
  let user = User.load(event.params._to.toHexString());
  if (!user) {
    user = new User(event.params._to.toHexString());
    user.save();
  }

}

export function handleURI(event: URI): void {}




export function handleStoryAdded(event: UriAdded): void {
  let story = Story.load(event.params.uri);
  if (!story) {
    story = new Story(event.params.uri);
    story.creator = event.params.from.toHexString();
    story.tokenID = event.params.tokenId;
    story.createdAtTimestamp = event.block.timestamp;
    story.uri = event.params.uri;
  }
  story.save();
}
