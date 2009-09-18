// commands are functions which make all the work in the gui
// but which can be called from different places
// they all accept two functions at the end (may be null)
// which will be called on success or on failure

function item_new(value,mtag,nextT,nextF) {
  var nT=nextT
  var nF=nextF

  var post_data={'item[value]': value}
  if(mtag)
    post_data['tag[]']=mtag.id

  $.ajax({
    type: "POST",
    url: "/items",
    data: post_data,
    success: suc(nT,nF,function(a) {
      var item=new Item(a.item.value,a.item.id)
      _d.add_item(item)
      $.each(a.item.tags,function(i,tag) {
        item.add_tag(_d.tag_id(tag.id))
      })
    }),
    error: te(nF)
  })
}

function item_delete(item_,nextT,nextF) {
  var nT=nextT
  var nF=nextF
  var item=item_
  $.ajax({
    type: "DELETE",
    url: "/items/"+item.id,
    success: suc(nT,nF,function(a) {
      $.each(item.tags.concat(),function(i,x) {
        x.items.splice(x.item(item),1)
      })
      _d.rm_item(item)
      item.ui.remove()
      item.uie.remove()
    }),
    error: te(nF)
  })
}

function item_update(item_,value,nextT,nextF) {
  var nT=nextT
  var nF=nextF
  var item=item_
  $.ajax({
    type: "PUT",
    url: "/items/"+item.id,
    data: {'item[value]': value},
    success: suc(nT,nF,function(a) {
      $('.value',item.ui).html(item.value=a.item.value)
    }),
    error: te(nF)
  })
}

function item_add_tag(item_,tag_,nextT,nextF) {
  var nT=nextT
  var nF=nextF
  var item=item_
  var tag=tag_

  if(item.has_tag(tag)) return

  $.ajax({
    type: "PUT",
    url: "/items/"+item.id+'/tag',
    data: 'tag[]='+tag.id,
    success: suc(nT,nF,function(a) { item.add_tag(tag) }),
    error: te(nF)
  })
}

function item_remove_tag(item_,tag_,nextT,nextF) {
  var nT=nextT
  var nF=nextF
  var item=item_
  var tag=tag_

  $.ajax({
    type: "DELETE",
    url: "/items/"+item.id+'/tag',
    data: 'tag[]='+tag.id,
    success: suc(nT,nF,function(a) {
      item.tags.splice(item.tag(tag),1)
      tag.items.splice(tag.item(item),1)
      $('.tag-id-'+tag.id,item.ui).remove()
      if(tag == _d.main_tag) {
        _d.rm_item(item)
        item.ui.remove()
        item.uie.remove()
      }
    }),
    error: te(nF)
  })
}

function tag_new(value,nextT,nextF) {
  var nT=nextT
  var nF=nextF
  $.ajax({
    type: "POST",
    url: "/tags",
    data: { 'tag[value]': value },
    success: suc(nT,nF,function(a) { _d.add_tag(new Tag(a.tag.value,a.tag.id)) }),
    error: te(nF)
  })
}

function tag_delete(tag_,nextT,nextF) {
  var nT=nextT
  var nF=nextF
  var tag=tag_
  $.ajax({
    type: "DELETE",
    url: "/tags/"+tag.id,
    success: suc(nT,nF,function(a) {
      $.each(tag.items.concat(),function(i,x) {
        x.tags.splice(x.tag(tag),1)
        tag.items.splice(tag.item(x),1)
        $('.tag-id-'+tag.id,x.ui).remove()
      })
      tag_unfilter(tag)
      _d.rm_tag(tag)
      if(tag == _d.main_tag) go_to('')
      tag.ui.remove()
      tag.uie.remove()
    }),
    error: te(nF)
  })
}

function tag_update(tag_,value,nextT,nextF) {
  var nT=nextT
  var nF=nextF
  var tag=tag_
  $.ajax({
    type: "PUT",
    url: "/tags/"+tag.id,
    data: { 'tag[value]' : value },
    success: suc(nT,nF,function(a) { tag.update(a.tag.value) }),
    error: te(nF)
  })
}

function tag_filter(tag,nextT,nextF) {
  if(tag == _d.main_tag || _d.has_filter(tag)) {
    nextF && nextF()
    return
  }

  tag.filtering=true
  $('.value',tag.ui).addClass('filter')
  _d.add_filter(tag)
  _d.update_filter()
  nextT && nextT()
}

function tag_unfilter(tag,nextT,nextF) {
  if(tag == _d.main_tag || !_d.has_filter(tag)) {
    nextF && nextF()
    return
  }

  tag.filtering=false
  $('.value',tag.ui).removeClass('filter')
  _d.rm_filter(tag)
  _d.update_filter()
  nextT && nextT()
}

function and_filtering(nextT,nextF) {
  if(_d.filter_type) {
    nextF && nextF()
  }
  _d.filter_type=true
  _d.update_filter()
  nextT && nextT()
}

function or_filtering(nextT,nextF) {
  if(!_d.filter_type) {
    nextF && nextF()
  }
  _d.filter_type=false
  _d.update_filter()
  nextT && nextT()
}
