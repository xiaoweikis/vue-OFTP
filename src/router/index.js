import Vue from 'vue'
import Router from 'vue-router'

import Item1 from '@/components/item1'
import Item2 from '@/components/item2'
import Item3 from '@/components/item3'
import Item4 from '@/components/item4'
import Item5 from '@/components/item5'
import Details from '@/secondLevel/details'
import Catalogue from '@/secondLevel/testCatalogue'
import managing from '@/secondLevel/managing'

Vue.use(Router)

export default new Router({
  mode: 'history',
  linkActiveClass:'is-active',//选中导航高亮
  base: '/OFTP/',
  routes: [
    {
      path: '',
      redirect: '/item1'
    },
    {
      path: '/item1',
      name: 'item1',
      component: Item1
    },
    {
      path:'/item2',
      name: 'item2',
      component: Item2  
    },
    {
      path:'/item3',
      name: 'item3',
      component: Item3
    },
    {
      path:'/item4',
      name: 'item4',
      component: Item4
    },
    {
      path:'/item5',
      component: Item5,
      children: [
        {
          path: '',
          name:'Details',
          component:Details
        },
        {
          path: '/item5/Catalogue',
          name:'Catalogue',
          component:Catalogue
        },
        {
          path:'/item5/managing',
          name:'managing',
          component:managing
        }
      ]
    }
  ]
})
